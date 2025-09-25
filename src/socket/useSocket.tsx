/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { socketService } from "./socketService";
// import { setConnectionStatus } from "../activities/activitiesSlice";
import { toast } from "sonner";

interface SocketContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  socketService: typeof socketService;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state?.auth || {});
  const { isConnected } = useAppSelector((state) => state?.activities || { isConnected: false });
  
  const isConnecting = useRef(false);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 3;

  const connect = async () => {
    if (!token || isConnecting.current || isConnected) {
      return;
    }

    try {
      isConnecting.current = true;
      connectionAttempts.current++;
      
      await socketService.connect(token);
      
      // Reset connection attempts on successful connection
      connectionAttempts.current = 0;
      
    } catch (error) {
      console.error("Socket connection failed:", error);
      
      // Show user-friendly error message
      if (connectionAttempts.current >= maxConnectionAttempts) {
        toast.error("Unable to connect to live updates. Please check your connection.");
      }
      
      // Don't retry automatically if max attempts reached
      if (connectionAttempts.current < maxConnectionAttempts) {
        // Retry after a delay
        setTimeout(() => {
          if (token && !isConnected) {
            connect();
          }
        }, 2000 * connectionAttempts.current); // Exponential backoff
      }
      
    } finally {
      isConnecting.current = false;
    }
  };

  const disconnect = () => {
    socketService.disconnect();
    connectionAttempts.current = 0;
  };

  // Auto-connect when token is available
  useEffect(() => {
    if (token && !isConnected && !isConnecting.current) {
      connect();
    }
  }, [token, isConnected]);

  // Auto-disconnect when token is removed (logout)
  useEffect(() => {
    if (!token && isConnected) {
      disconnect();
    }
  }, [token, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  // Monitor connection status changes
  useEffect(() => {
    if (isConnected && connectionAttempts.current > 0) {
      // Successfully reconnected
      toast.success("Reconnected to live updates");
    }
  }, [isConnected]);

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