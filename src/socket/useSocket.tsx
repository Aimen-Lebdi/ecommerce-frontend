/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAppSelector } from "../app/hooks";
import { socketService } from "./socketService";
import { toast } from "sonner";

interface SocketContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  socketService: typeof socketService;
}

/**
 * Defer work until the browser is idle so it never competes with first paint.
 * Falls back to a short timeout where requestIdleCallback is unavailable, and
 * always returns a cancel function suitable for effect cleanup.
 */
const scheduleWhenIdle = (task: () => void): (() => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 200);
  return () => window.clearTimeout(id);
};

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { accessToken, user } = useAppSelector((state) => state?.auth || {});
  const { isConnected } = useAppSelector((state) => state?.activities || { isConnected: false });

  const isConnecting = useRef(false);
  // C3: Track whether we were previously connected so the "Reconnected" toast
  // only fires after a real drop, not on the initial connection.
  const wasConnectedRef = useRef(false);
  // Only (re)connect when the token actually changes — avoids reconnect churn
  // on user-snapshot updates (e.g. fetchCurrentUser after a profile edit).
  const lastAccessTokenRef = useRef<string | null>(null);

  // C2: Minimal guard — require a user. The socket service reads the latest
  // token from localStorage and self-heals on stale/expired tokens (B2), so
  // there's no need to block on isRefreshing or isConnected here.
  const connect = async () => {
    if (!accessToken || !user || isConnecting.current) {
      return;
    }

    try {
      isConnecting.current = true;
      await socketService.connect();
    } catch (error) {
      // Transient failures are retried by socket.io's built-in reconnection,
      // and auth failures self-heal — so just log here.
      console.error("❌ Socket connection failed:", error);
    } finally {
      isConnecting.current = false;
    }
  };

  const disconnect = () => {
    console.log("🔌 Disconnecting socket...");
    socketService.disconnect();
  };

  // C1: Connect when authenticated; disconnect when the token is removed
  // (logout / tokenExpired). No disconnect+reconnect churn on token changes —
  // the socket service self-heals (reads localStorage, refreshes on auth error).
  useEffect(() => {
    let cancelIdleConnect: (() => void) | undefined;
    if (accessToken && user) {
      if (lastAccessTokenRef.current !== accessToken) {
        lastAccessTokenRef.current = accessToken;
        // Defer the handshake off the critical path: guests never download or
        // run the socket.io chunk during load; authenticated users connect
        // once the main thread goes idle.
        cancelIdleConnect = scheduleWhenIdle(connect);
      }
    } else {
      lastAccessTokenRef.current = null;
      disconnect();
    }
    return () => cancelIdleConnect?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  // C3: Reconnect toast — fires when the connection drops and later returns.
  useEffect(() => {
    if (isConnected) {
      if (wasConnectedRef.current) {
        toast.success("Reconnected to live updates");
      }
      wasConnectedRef.current = true;
    } else {
      wasConnectedRef.current = false;
    }
  }, [isConnected]);

  // C3: Failure toast — surfaced when the socket gives up reconnecting.
  useEffect(() => {
    const handleSocketFailure = () => {
      toast.error("Unable to connect to live updates. Please refresh the page.");
    };
    window.addEventListener("socket_connection_failed", handleSocketFailure);
    return () => {
      window.removeEventListener("socket_connection_failed", handleSocketFailure);
    };
  }, []);

  const contextValue: SocketContextType = {
    isConnected,
    connect,
    disconnect,
    socketService,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

export default SocketProvider;