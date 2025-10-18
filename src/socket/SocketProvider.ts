/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "../app/hooks";
import { socketService } from "./socketService";

interface UseSocketOptions {
  autoConnect?: boolean;
  joinDashboard?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    autoConnect = false,
    joinDashboard = false,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const { isConnected } = useAppSelector((state) => state.activities);
  // FIXED: Use accessToken instead of token
  const { user, accessToken } = useAppSelector((state) => state.auth);
  
  const isConnecting = useRef(false);
  const hasJoinedDashboard = useRef(false);

  // Connect to socket
  const connect = useCallback(async () => {
    // FIXED: Check accessToken instead of token
    if (!accessToken || isConnecting.current || isConnected) {
      return;
    }

    try {
      isConnecting.current = true;
      // FIXED: Pass accessToken to socket service
      await socketService.connect(accessToken);
      onConnect?.();
    } catch (error) {
      console.error("Socket connection failed:", error);
      onError?.(error);
    } finally {
      isConnecting.current = false;
    }
  }, [accessToken, isConnected, onConnect, onError]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    socketService.disconnect();
    hasJoinedDashboard.current = false;
    onDisconnect?.();
  }, [onDisconnect]);

  // Join dashboard room (for admins)
  const joinDashboardRoom = useCallback(() => {
    if (socketService.isConnected() && user?.role === "admin" && !hasJoinedDashboard.current) {
      socketService.joinDashboard();
      hasJoinedDashboard.current = true;
    }
  }, [user?.role]);

  // Leave dashboard room
  const leaveDashboard = useCallback(() => {
    if (socketService.isConnected()) {
      socketService.leaveDashboard();
      hasJoinedDashboard.current = false;
    }
  }, []);

  // Filter activities
  const filterActivities = useCallback((filters: { type?: string; timeframe?: string }) => {
    if (socketService.isConnected()) {
      socketService.filterActivities(filters);
    }
  }, []);

  // Request activity stats
  const requestActivityStats = useCallback(() => {
    if (socketService.isConnected()) {
      socketService.requestActivityStats();
    }
  }, []);

  // Request user activities
  const requestMyActivities = useCallback(() => {
    if (socketService.isConnected()) {
      socketService.requestMyActivities();
    }
  }, []);

  // Ping connection
  const ping = useCallback(() => {
    if (socketService.isConnected()) {
      socketService.ping();
    }
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect && accessToken && !isConnected && !isConnecting.current) {
      connect();
    }
  }, [autoConnect, accessToken, isConnected, connect]);

  // Auto-join dashboard for admins
  useEffect(() => {
    if (joinDashboard && isConnected && user?.role === "admin" && !hasJoinedDashboard.current) {
      joinDashboardRoom();
    }
  }, [joinDashboard, isConnected, user?.role, joinDashboardRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  // Health check interval
  useEffect(() => {
    if (!isConnected) return;

    const healthCheckInterval = setInterval(() => {
      ping();
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [isConnected, ping]);

  return {
    isConnected,
    connect,
    disconnect,
    joinDashboard: joinDashboardRoom,
    leaveDashboard,
    filterActivities,
    requestActivityStats,
    requestMyActivities,
    ping,
    socketService,
  };
};

export default useSocket;