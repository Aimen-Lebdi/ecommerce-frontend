/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { socketService } from "./socketService";
import { setConnectionStatus } from "../activities/activitiesSlice";

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

  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.activities);
  const { user, token } = useAppSelector((state) => state.auth);
  
  const isConnecting = useRef(false);
  const hasJoinedDashboard = useRef(false);

  // Connect to socket
  const connect = useCallback(async () => {
    if (!token || isConnecting.current) {
      return;
    }

    try {
      isConnecting.current = true;
      await socketService.connect(token);
      onConnect?.();
    } catch (error) {
      console.error("Socket connection failed:", error);
      onError?.(error);
    } finally {
      isConnecting.current = false;
    }
  }, [token, onConnect, onError]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    socketService.disconnect();
    hasJoinedDashboard.current = false;
    onDisconnect?.();
  }, [onDisconnect]);

  // Join dashboard room (for admins)
  const joinDashboard = useCallback(() => {
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
    if (autoConnect && token && !isConnected && !isConnecting.current) {
      connect();
    }
  }, [autoConnect, token, isConnected, connect]);

  // Auto-join dashboard for admins
  useEffect(() => {
    if (joinDashboard && isConnected && user?.role === "admin" && !hasJoinedDashboard.current) {
      joinDashboard();
    }
  }, [joinDashboard, isConnected, user?.role, joinDashboard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

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
    joinDashboard,
    leaveDashboard,
    filterActivities,
    requestActivityStats,
    requestMyActivities,
    ping,
    socketService,
  };
};