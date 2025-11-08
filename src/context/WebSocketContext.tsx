"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { useListenKey } from "@/hooks/useListenKey";

interface WebSocketMessage {
  channel: string;
  action: string;
  data?: unknown;
  error?: string | unknown;
  [key: string]: unknown;
}

interface ChannelSubscription {
  channel: string;
  params: Record<string, unknown>;
  onMessage: (data: WebSocketMessage) => void;
}

interface WebSocketContextValue {
  subscribe: (
    channel: string,
    params: Record<string, unknown>,
    onMessage: (data: WebSocketMessage) => void
  ) => () => void;
  send: (data: Record<string, unknown>) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
}

export function WebSocketProvider({
  children,
  url = process.env.NEXT_PUBLIC_WS_URL || "wss://api-cex.tahoanghiep.com/ws",
}: WebSocketProviderProps) {
  const { listenKey, listenKeyFetched, fetchListenKey } = useListenKey();
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Map<string, ChannelSubscription>>(new Map());

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const subscribe = useCallback(
    (
      channel: string,
      params: Record<string, unknown>,
      onMessage: (data: WebSocketMessage) => void
    ) => {
      const key = `${channel}:${JSON.stringify(params)}`;
      subscriptionsRef.current.set(key, { channel, params, onMessage });

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ action: "subscribe", channel, params });
      }

      return () => {
        subscriptionsRef.current.delete(key);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          send({ action: "unsubscribe", channel });
        }
      };
    },
    [send]
  );

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.error) {
          const errorMsg = message.error;
          if (
            typeof errorMsg === "string" &&
            (errorMsg.includes("hết hạn") ||
              errorMsg.includes("Không hợp lệ") ||
              errorMsg.includes("expired") ||
              errorMsg.includes("invalid"))
          ) {
            console.warn("[WS] ListenKey expired/invalid, refreshing...");
            // Tạo listenKey mới và reconnect
            fetchListenKey(true).then(() => {
              // Reconnect sẽ tự động khi listenKey thay đổi
            });
            return;
          }
        }

        if (message.action === "connected") {
          for (const [, sub] of subscriptionsRef.current) {
            send({
              action: "subscribe",
              channel: sub.channel,
              params: sub.params,
            });
          }
          return;
        }

        if (!message.channel) return;

        for (const [, sub] of subscriptionsRef.current) {
          if (sub.channel !== message.channel) continue;

          const paramsMatch = Object.keys(sub.params).every((paramKey) => {
            const subValue = sub.params[paramKey];
            const msgValue = message[paramKey];
            if (subValue === undefined || subValue === null) return true;
            if (subValue === msgValue) return true;
            if (
              typeof message.data === "object" &&
              message.data !== null &&
              paramKey in message.data
            )
              return true;
            return msgValue === undefined;
          });

          if (paramsMatch) {
            sub.onMessage(message);
            break;
          }
        }
      } catch (error) {
        console.error("[WS] Error:", error);
      }
    },
    [send, fetchListenKey]
  );

  useEffect(() => {
    // Chỉ kết nối sau khi đã fetch listenKey (nếu có accessToken)
    if (!listenKeyFetched) return;

    // Close existing connection if listenKey changed
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const wsUrl = listenKey ? `${url}?listenKey=${listenKey}` : url;
      console.log("[WS] WebSocket URL:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        for (const [, sub] of subscriptionsRef.current) {
          send({
            action: "subscribe",
            channel: sub.channel,
            params: sub.params,
          });
        }
      };

      ws.onmessage = handleMessage;
      ws.onclose = (event) => {
        wsRef.current = null;
        // ✅ Nếu close code là 1008 (policy violation) hoặc có error, có thể do listenKey hết hạn
        // Validate listenKey trước khi reconnect
        if (listenKey && (event.code === 1008 || event.code === 1002)) {
          console.warn(
            "[WS] Connection closed with error, validating listenKey..."
          );
          fetchListenKey(true);
        }
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, listenKey, listenKeyFetched, handleMessage, send, fetchListenKey]);

  return (
    <WebSocketContext.Provider value={{ subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within WebSocketProvider"
    );
  }
  return context;
}
