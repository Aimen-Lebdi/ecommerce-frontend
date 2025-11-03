/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";
import { store } from "../app/Store";
import {
  setConnectionStatus,
  addRealtimeActivity,
  setInitialActivities,
  updateActivityStats,
  type Activity,
  type ActivityStats,
} from "../features/activities/activitiesSlice";

interface SocketResponse {
  activities?: Activity[];
  activity?: Activity;
  stats?: any[];
  total?: number;
  timeframe?: string;
  timestamp?: string;
  message?: string;
  user?: any;
  filters?: any;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private hasRequestedInitialActivities = false;
  private hasJoinedDashboard = false;

  // Initialize socket connection with accessToken
  async connect(accessToken: string): Promise<void> {
    try {
      // Disconnect existing connection if any
      if (this.socket) {
        this.disconnect();
      }

      console.log('🔌 Connecting to socket with access token...');

      // Create new socket connection
      this.socket = io(import.meta.env.VITE_BASE_URL || "http://localhost:5000", {
        auth: {
          token: accessToken // Use accessToken for authentication
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error("Socket not initialized"));

        const connectTimeout = setTimeout(() => {
          reject(new Error("Socket connection timeout"));
        }, 20000);

        this.socket.on("connect", () => {
          clearTimeout(connectTimeout);
          console.log("✅ Socket connected successfully with ID:", this.socket?.id);
          this.reconnectAttempts = 0;
          store.dispatch(setConnectionStatus(true));
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          clearTimeout(connectTimeout);
          console.error("❌ Socket connection error:", error);
          store.dispatch(setConnectionStatus(false));
          reject(error);
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
      this.reconnectAttempts = 0;
      // Reset flags on reconnection
      this.hasRequestedInitialActivities = false;
      this.hasJoinedDashboard = false;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      this.hasRequestedInitialActivities = false;
      this.hasJoinedDashboard = false;
      store.dispatch(setConnectionStatus(false));
      
      // Attempt to reconnect if disconnection was unexpected
      if (reason === "io server disconnect") {
        console.log("Server initiated disconnect - manual reconnection required");
      } else {
        this.handleReconnection();
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      store.dispatch(setConnectionStatus(true));
      this.reconnectAttempts = 0;
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("⚠️ Socket reconnection error:", error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("❌ Max reconnection attempts reached");
        store.dispatch(setConnectionStatus(false));
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

    this.socket.on("activity_update", (data: Activity) => {
      console.log("🔄 Activity update received:", data.activity);
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
          timeframe: data.timeframe,
        };
        store.dispatch(updateActivityStats(statsUpdate));
      }
    });

    this.socket.on("my_activities", (data: SocketResponse) => {
      console.log("👤 User activities received:", data.activities?.length || 0, "activities");
      if (data.activities) {
        store.dispatch(setInitialActivities(data.activities));
      }
    });

    // Dashboard events
    this.socket.on("dashboard_joined", (data: SocketResponse) => {
      console.log("📊 Dashboard joined successfully:", data.message);
      this.hasJoinedDashboard = true;
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

  // Handle reconnection logic
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  // FIXED: Request initial activities - only after joining dashboard
  requestInitialActivities(): void {
    if (this.socket && this.socket.connected && !this.hasRequestedInitialActivities && this.hasJoinedDashboard) {
      console.log("📥 Requesting initial activities...");
      this.hasRequestedInitialActivities = true;
      this.socket.emit("request_initial_activities");
    } else if (!this.hasJoinedDashboard) {
      console.warn("⚠️ Cannot request initial activities - dashboard not joined yet");
    }
  }

  // FIXED: Join dashboard room - waits for confirmation before requesting activities
  joinDashboard(): void {
    if (this.socket && this.socket.connected && !this.hasJoinedDashboard) {
      console.log("📊 Joining dashboard room...");
      this.socket.emit("join_dashboard");
      // Activities will be sent automatically after join_dashboard event is processed
    }
  }

  // Leave dashboard room
  leaveDashboard(): void {
    if (this.socket && this.socket.connected && this.hasJoinedDashboard) {
      console.log("👋 Leaving dashboard room...");
      this.socket.emit("leave_dashboard");
      this.hasJoinedDashboard = false;
      this.hasRequestedInitialActivities = false;
    }
  }

  // Filter activities
  filterActivities(filters: {
    type?: string;
    timeframe?: string;
  }): void {
    if (this.socket && this.socket.connected) {
      console.log("🔍 Requesting filtered activities:", filters);
      this.socket.emit("filter_activities", filters);
    }
  }

  // Request activity statistics
  requestActivityStats(): void {
    if (this.socket && this.socket.connected) {
      console.log("📊 Requesting activity stats...");
      this.socket.emit("request_activity_stats");
    }
  }

  // Request user's own activities
  requestMyActivities(): void {
    if (this.socket && this.socket.connected) {
      console.log("👤 Requesting my activities...");
      this.socket.emit("get_my_activities");
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
      this.hasRequestedInitialActivities = false;
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