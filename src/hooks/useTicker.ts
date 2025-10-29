import { useState, useEffect, useRef, useCallback } from "react";

export interface TickerSymbol {
  symbol: string;
  base_asset: string;
  quote_asset: string;
  price: number;
  priceChangePercent24h: number;
}

export function useTicker(quoteAsset: string = "USDT", type: string = "spot") {
  const [tickers, setTickers] = useState<TickerSymbol[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    const wsUrl = `${baseUrl}/ws/ticker?quote_asset=${quoteAsset}&type=${type}`;

    console.log(`🔗 Connecting to Ticker WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ Ticker WebSocket connected");
      setConnected(true);
      setLoading(false);
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (
          message.action === "initial" ||
          message.action === "update" ||
          message.action === "trade_update"
        ) {
          setTickers(message.data || []);
          setLastUpdate(message.timestamp || Date.now());

          if (message.action === "trade_update") {
            console.log(
              `📊 Ticker update: ${message.data?.length} symbols updated`
            );
          }
        }
      } catch (err) {
        console.error("❌ Error parsing ticker message:", err);
        setError("Failed to parse ticker data");
      }
    };

    ws.onerror = (event) => {
      console.error("❌ Ticker WebSocket error:", event);
      setError("WebSocket connection error");
    };

    ws.onclose = () => {
      console.log("🔌 Ticker WebSocket disconnected");
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
  }, [quoteAsset, type]);

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

  return { tickers, connected, loading, error, lastUpdate };
}
