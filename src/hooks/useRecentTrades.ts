import { useEffect, useState, useRef, useCallback } from "react";

export interface RecentTrade {
  id: string;
  symbol: string;
  price: string;
  quantity: string;
  time: number;
  takerSide: "BUY" | "SELL";
}

interface BackendRecentTrades {
  symbol: string;
  trades: RecentTrade[];
  action?: string;
  timestamp?: number;
}

export const useRecentTrades = (symbol: string = "BTCUSDT") => {
  const [trades, setTrades] = useState<RecentTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    // Cleanup existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL || `${protocol}://api-cex.tahoanghiep.com`;
    const wsUrl = `${baseUrl}/ws/trades?symbol=${symbol}`;

    console.log(`🔗 Connecting to RecentTrades WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`✅ RecentTrades WebSocket connected for ${symbol}`);
      setConnected(true);
      setLoading(false);
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      try {
        const msg: BackendRecentTrades = JSON.parse(data);
        if (msg.trades && Array.isArray(msg.trades)) {
          setTrades(msg.trades);
          setLastUpdate(msg.timestamp || Date.now());

          if (msg.action === "trade_update") {
            console.log(
              `📊 RecentTrades update for ${symbol}: ${msg.trades.length} trades`
            );
          }
        }
      } catch (err) {
        console.error("❌ Failed to parse trades message:", err);
        setError("Failed to parse trades data");
      }
    };

    ws.onerror = (event) => {
      console.error("❌ WebSocket error for recent trades:", event);
      setError("WebSocket connection error");
    };

    ws.onclose = () => {
      console.log(`🔌 RecentTrades WebSocket disconnected for ${symbol}`);
      setConnected(false);

      // Auto-reconnect with exponential backoff
      const maxAttempts = 5;
      const baseDelay = 1000;

      if (reconnectAttemptsRef.current < maxAttempts) {
        const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current);
        console.log(
          `🔄 Reconnecting in ${delay}ms (attempt ${
            reconnectAttemptsRef.current + 1
          }/${maxAttempts})...`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        setError("Failed to connect after multiple attempts");
      }
    };

    wsRef.current = ws;
  }, [symbol]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { trades, loading, error, connected, lastUpdate };
};
