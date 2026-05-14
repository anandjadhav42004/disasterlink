"use client";

import { useEffect, useMemo, useState } from "react";
import { connectSocket, disconnectSocket, getSocket, type ServerToClientEvent } from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";

export function useSocket() {
  const { user, role, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    const socket = connectSocket({ id: user.id, role: role || "citizen" });
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    setIsConnected(socket.connected);

    // Friend's specific event listeners
    socket.on('new-sos', (data) => {
      console.log('New SOS:', data);
      window.dispatchEvent(new CustomEvent('new-sos', { detail: data }));
    });
    socket.on('map-update', (data) => {
      window.dispatchEvent(new CustomEvent('map-update', { detail: data }));
    });
    socket.on('volunteer-assigned', (data) => {
      window.dispatchEvent(new CustomEvent('volunteer-assigned', { detail: data }));
    });
    socket.on('emergency-alert', (data) => {
      window.dispatchEvent(new CustomEvent('emergency-alert', { detail: data }));
    });
    socket.on('sos-status-update', (data) => {
      window.dispatchEvent(new CustomEvent('sos-status-update', { detail: data }));
    });
    socket.on('rescue-completed', (data) => {
      window.dispatchEvent(new CustomEvent('rescue-completed', { detail: data }));
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      disconnectSocket();
    };
  }, [isAuthenticated, role, user]);

  const api = useMemo(() => {
    const socket = getSocket();
    return {
      socket,
      on: <T>(event: ServerToClientEvent, handler: (payload: T) => void) => {
        socket.on(event, handler);
        return () => {
          socket.off(event, handler);
        };
      },
      emit: (event: string, payload?: unknown) => {
        const socket = getSocket();
        if (socket.connected) {
          socket.emit(event, payload);
        }
      }
    };
  }, []);

  return { ...api, isConnected };
}
