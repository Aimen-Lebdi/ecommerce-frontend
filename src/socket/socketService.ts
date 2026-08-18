/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";
import { store } from "../app/Store";
import { refreshTokenAPI } from "../features/auth/authAPI";
import {
  setConnectionStatus,
  addRealtimeActivity,
  setInitialActivities,
  updateActivityStats,
  type Activity,
  type ActivityStats,
} from "../features/activities/activitiesSlice";

// Single source of truth for the socket URL, token storage key and retry cap.
const SOCKET_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
const TOKEN_STORAGE_KEY = "accessToken";
const MAX_RECONNECTION_ATTEMPTS = 10;
// Throttle token-refresh calls so a permanently-refused handshake does not
// hammer the auth endpoint on every socket.io reconnection attempt.
const AUTH_REFRESH_THROTTLE_MS = 10_000;

interface SocketResponse {
  activities?: Activity[];
  activity?: Activity;
  stats?: any[];
  dailyStats?: any[];
  total?: number;
  timeframe?: string;
  timestamp?: string;
  message?: string;
  user?: any;
  filters?: any;
}

class SocketService {
  private socket: Socket | null = null;
  private hasJoinedDashboard = false;
  private authRefreshThrottledUntil = 0;

  // B1: Read the latest access token from localStorage at (re)connect time so
  // the socket always uses the freshest token (the axios silent refresh only
  // writes localStorage, never Redux). The accessToken arg is kept for
  // backward compatibility but is no longer the only source of truth.
  async connect(accessToken?: string): Promise<void> {
    const token = accessToken || localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      console.warn("🔌 Socket connect aborted: no access token available");
      store.dispatch(setConnectionStatus(false));
      return;
    }

    try {
      // Disconnect existing connection if any
      if (this.socket) {
        this.disconnect();
      }

      console.log("🔌 Connecting to socket with access token...");

      // Create new socket connection
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        // B3: Cap built-in reconnection attempts — socket.io is the single
        // source of truth for retries (no manual reconnection loop).
        reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error("Socket not initialized"));

        const connectTimeout = setTimeout(() => {
          reject(new Error("Socket connection timeout"));
        }, 20000);

        this.socket.once("connect", () => {
          clearTimeout(connectTimeout);
          console.log("✅ Socket connected successfully with ID:", this.socket?.id);
          store.dispatch(setConnectionStatus(true));
          resolve();
        });

        this.socket.once("connect_error", (error) => {
          clearTimeout(connectTimeout);
          if (this.isAuthError(error)) {
            // B2: Auth errors self-heal (refresh + reconnect) — settle the
            // promise so callers don't hang or show a premature failure toast.
            console.warn("❌ Socket auth error:", error.message);
            resolve();
          } else {
            console.error("❌ Socket connection error:", error.message);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      store.dispatch(setConnectionStatus(false));
      throw error;
    }
  }

  // Setup all event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Socket connected with ID:", this.socket?.id);
      store.dispatch(setConnectionStatus(true));
      this.authRefreshThrottledUntil = 0;
      // Reset flags on (re)connection - a reconnected socket must re-join
      this.hasJoinedDashboard = false;
      // FIXED (M4): Auto (re)join the dashboard on every connect so admins
      // receive live updates again after a reconnect. The server auto-sends
      // a fresh initial_activities payload on each join (it resets its own
      // hasReceivedInitialActivities per connection).
      this.joinDashboard();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      this.hasJoinedDashboard = false;
      store.dispatch(setConnectionStatus(false));
      // B3: No manual reconnection loop — socket.io's built-in reconnection
      // (with a capped attempt count) handles network drops automatically.
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      store.dispatch(setConnectionStatus(true));
    });

    this.socket.on("reconnect_attempt", (_attemptNumber) => {
      // socket.io manages reconnection internally; no local tracking needed
    });

    this.socket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed after max attempts");
      store.dispatch(setConnectionStatus(false));
      this.hasJoinedDashboard = false;
      // C3: Notify the UI so it can surface a "live updates unavailable" toast.
      window.dispatchEvent(new Event("socket_connection_failed"));
    });

    // B2: Distinguish auth rejections (refresh + self-heal) from network
    // errors (socket.io built-in reconnection).
    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      store.dispatch(setConnectionStatus(false));
      if (this.isAuthError(error)) {
        this.handleAuthError();
      }
    });

    // Authentication events
    this.socket.on("admin_connected", (data: SocketResponse) => {
      console.log("👑 Admin connected:", data);
    });

    this.socket.on("user_connected", (data: SocketResponse) => {
      console.log("👤 User connected:", data);
    });

    // Activity events
    this.socket.on("new_activity", (data: Activity) => {
      console.log("🆕 New activity received:", data.activity);
      store.dispatch(addRealtimeActivity(data));
    });

    this.socket.on("initial_activities", (data: SocketResponse) => {
      console.log("📋 Initial activities received:", data.activities?.length || 0, "activities");
      if (data.activities) {
        store.dispatch(setInitialActivities(data.activities));
      }
    });

    this.socket.on("filtered_activities", (data: SocketResponse) => {
      console.log("🔍 Filtered activities received:", data.activities?.length || 0, "activities");
      if (data.activities) {
        store.dispatch(setInitialActivities(data.activities));
      }
    });

    this.socket.on("activity_stats", (data: SocketResponse) => {
      console.log("📊 Activity stats received:", data);
      if (data.stats && data.total !== undefined && data.timeframe) {
        const statsUpdate: Partial<ActivityStats> = {
          totalActivities: data.total,
          typeStats: data.stats,
          dailyStats: data.dailyStats ?? [],
          timeframe: data.timeframe,
        };
        store.dispatch(updateActivityStats(statsUpdate));
      }
    });

    // Dashboard events
    this.socket.on("dashboard_joined", (data: SocketResponse) => {
      console.log("📊 Dashboard joined successfully:", data.message);
      this.hasJoinedDashboard = true;
      // FIXED (M6): Seed/refresh realtime stats right after joining so the
      // dashboard has live metrics even before the first new activity arrives
      // (and again after every reconnect).
      this.requestActivityStats();
    });

    this.socket.on("dashboard_left", (data: SocketResponse) => {
      console.log("👋 Dashboard left:", data.message);
      this.hasJoinedDashboard = false;
    });

    this.socket.on("dashboard_error", (data: SocketResponse) => {
      console.error("⚠️ Dashboard error:", data.message);
    });

    // Error events
    this.socket.on("activity_error", (data: SocketResponse) => {
      console.error("⚠️ Activity error:", data.message);
    });

    this.socket.on("error", (error) => {
      console.error("⚠️ Socket error:", error);
    });

    // Ping/Pong for connection health
    this.socket.on("pong", (data) => {
      console.log("🏓 Pong received:", data);
    });
  }

  // B2: On an authentication connect_error, refresh the access token via the
  // existing axios refresh flow, persist it, update the socket auth and
  // reconnect. Throttled so a permanently-refused handshake doesn't hammer the
  // refresh endpoint on every socket.io reconnection attempt.
  private async handleAuthError(): Promise<void> {
    const now = Date.now();
    if (now < this.authRefreshThrottledUntil || !this.socket) return;

    this.authRefreshThrottledUntil = now + AUTH_REFRESH_THROTTLE_MS;
    console.log("🔄 Socket auth error — refreshing access token...");

    try {
      const { accessToken } = await refreshTokenAPI();
      if (!accessToken) throw new Error("Refresh returned no token");

      // Persist + update the socket auth for the next connection attempt.
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      this.updateAuthToken(accessToken);

      console.log("✅ Socket access token refreshed — reconnecting...");
      // Reconnect with the fresh token (no-op if socket.io is already retrying).
      this.socket.connect();
    } catch (error) {
      // Refresh failed — go offline; socket.io's capped reconnection will
      // keep retrying and reconnect_failed marks the final state.
      console.error("❌ Socket token refresh failed:", error);
      store.dispatch(setConnectionStatus(false));
    }
  }

  // B4: Update the auth token on the active socket. Useful for external callers
  // that obtain a fresh token out-of-band (e.g. after a manual refresh).
  updateAuthToken(token: string): void {
    if (this.socket) {
      (this.socket.auth as Record<string, string>).token = token;
    }
  }

  // Whether the connect_error came from the server's auth middleware
  // (e.g. "Authentication error: Token expired").
  private isAuthError(error: any): boolean {
    return (
      typeof error?.message === "string" &&
      error.message.includes("Authentication error")
    );
  }

  // FIXED (M4): Single source of truth for joining the dashboard room.
  // Called on every connect (initial + reconnect) for admins, so the
  // dashboard re-joins after a reconnect without a component-level guard.
  // The server auto-sends initial_activities after each successful join.
  joinDashboard(): void {
    const userRole = (store.getState() as any)?.auth?.user?.role;
    if (userRole !== "admin") {
      return; // Dashboard room is admin-only (server enforces this too)
    }
    if (this.socket && this.socket.connected && !this.hasJoinedDashboard) {
      console.log("📊 Joining dashboard room...");
      this.socket.emit("join_dashboard");
    }
  }

  // Leave dashboard room
  leaveDashboard(): void {
    if (this.socket && this.socket.connected && this.hasJoinedDashboard) {
      console.log("👋 Leaving dashboard room...");
      this.socket.emit("leave_dashboard");
      this.hasJoinedDashboard = false;
    }
  }

  // Request activity statistics
  requestActivityStats(): void {
    if (this.socket && this.socket.connected) {
      console.log("📊 Requesting activity stats...");
      this.socket.emit("request_activity_stats");
    }
  }

  // Send ping to check connection
  ping(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("ping");
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      console.log("🔌 Disconnecting socket...");
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.hasJoinedDashboard = false;
      store.dispatch(setConnectionStatus(false));
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Check if dashboard is joined
  isDashboardJoined(): boolean {
    return this.hasJoinedDashboard;
  }

  // Get socket instance (use with caution)
  getSocket(): Socket | null {
    return this.socket;
  }

  // Manually emit custom events
  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("⚠️ Socket not connected. Cannot emit event:", event);
    }
  }

  // Listen to custom events
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove listener for custom events
  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;