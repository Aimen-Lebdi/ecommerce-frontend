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

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { accessToken, user, isRefreshing } = useAppSelector((state) => state?.auth || {});
  const { isConnected } = useAppSelector((state) => state?.activities || { isConnected: false });
  
  const isConnecting = useRef(false);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 3;
  const mountedRef = useRef(true);
  const lastAccessTokenRef = useRef<string | null>(null);

  const connect = async () => {
    // Don't connect while refreshing or if no token
    if (!accessToken || isConnecting.current || isConnected || isRefreshing) {
      return;
    }

    try {
      isConnecting.current = true;
      connectionAttempts.current++;
      
      console.log(`🔌 Connecting socket (attempt ${connectionAttempts.current}/${maxConnectionAttempts})...`);
      
      await socketService.connect(accessToken);
      
      console.log("✅ Socket connected successfully");
      lastAccessTokenRef.current = accessToken;
      connectionAttempts.current = 0;
      
    } catch (error) {
      console.error("❌ Socket connection failed:", error);
      
      if (connectionAttempts.current >= maxConnectionAttempts) {
        toast.error("Unable to connect to live updates. Please refresh the page.");
        connectionAttempts.current = 0;
      } else if (connectionAttempts.current < maxConnectionAttempts && mountedRef.current) {
        // Exponential backoff retry
        const retryDelay = 2000 * Math.pow(2, connectionAttempts.current - 1);
        console.log(`🔄 Retrying in ${retryDelay}ms...`);
        
        setTimeout(() => {
          if (mountedRef.current && accessToken && !isConnected && !isRefreshing) {
            connect();
          }
        }, retryDelay);
      }
      
    } finally {
      isConnecting.current = false;
    }
  };

  const disconnect = () => {
    console.log("🔌 Disconnecting socket...");
    socketService.disconnect();
    connectionAttempts.current = 0;
    lastAccessTokenRef.current = null;
  };

  // FIXED: Monitor isRefreshing flag - disconnect when refresh starts
  useEffect(() => {
    if (isRefreshing && isConnected) {
      console.log("🔄 Token refresh in progress, disconnecting socket...");
      disconnect();
    }
  }, [isRefreshing, isConnected]);

  // FIXED: Connect/reconnect when token changes and refresh is complete
  useEffect(() => {
    // Only proceed if we have all required data and not refreshing
    if (!accessToken || !user || isRefreshing) {
      return;
    }

    // If token changed, disconnect and reconnect
    if (lastAccessTokenRef.current && lastAccessTokenRef.current !== accessToken) {
      console.log("🔄 Access token changed, reconnecting socket...");
      disconnect();
      
      // Small delay to ensure old connection is fully closed
      setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, 500);
    } 
    // If no previous token and not connected, connect
    else if (!lastAccessTokenRef.current && !isConnected && !isConnecting.current) {
      // Initial connection - add delay for token to settle
      setTimeout(() => {
        if (mountedRef.current && accessToken && !isRefreshing) {
          console.log("🔄 Initial socket connection...");
          connect();
        }
      }, 1000);
    }
  }, [accessToken, user, isRefreshing]);

  // Disconnect when token is removed (logout)
  useEffect(() => {
    if (!accessToken && isConnected) {
      console.log("🔓 No access token, disconnecting...");
      disconnect();
    }
  }, [accessToken, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  // Monitor connection status changes
  useEffect(() => {
    if (isConnected && connectionAttempts.current > 0) {
      toast.success("Reconnected to live updates");
      connectionAttempts.current = 0;
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