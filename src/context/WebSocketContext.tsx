"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface WebSocketContextType {
  connected: boolean;
  setConnected: (connected: boolean) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);

  return (
    <WebSocketContext.Provider value={{ connected, setConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
