import { useEffect, useState, useRef, useCallback } from "react";

export interface MarketData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  volume24h: number;
  quoteAssetVolume24h: number;
  name: string;
}

interface BackendMarketDataMessage {
  symbol: string;
  type: string;
  data: MarketData;
  action?: string; // 'trade_update' from backend
  timestamp?: number;
}

export const useMarketData = (
  symbol: string = "BTCUSDT",
  type: string = "spot"
) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
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
    const wsUrl = `${baseUrl}/ws/market-data?symbol=${symbol}&type=${type}`;

    console.log(`🔗 Connecting to MarketData WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`✅ MarketData WebSocket connected for ${symbol}`);
      setConnected(true);
      setLoading(false);
      setError(null);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      try {
        const msg: BackendMarketDataMessage = JSON.parse(data);

        if (msg.data) {
          setMarketData(msg.data);
          setLastUpdate(msg.timestamp || Date.now());

          // Log trade updates (not initial load)
          if (msg.action === "trade_update") {
            console.log(
              `📊 MarketData update for ${symbol}: $${msg.data.price}`
            );
          }
        }
      } catch (err) {
        console.error("❌ Failed to parse market data message:", err);
      }
    };

    ws.onerror = (event) => {
      setError("WebSocket Error");
      console.error("❌ WebSocket error for market data:", event);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log(`🔌 MarketData WebSocket closed for ${symbol}`);

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
  }, [symbol, type]);

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

  return { marketData, loading, error, connected, lastUpdate };
};
