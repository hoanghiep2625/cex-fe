import { useState, useEffect, useRef, useCallback } from "react";

export interface Candle {
  symbol: string;
  type: string;
  interval: string;
  open_time: number;
  close_time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  quote_volume: string;
  number_of_trades: number;
  taker_buy_base_volume: string;
  taker_buy_quote_volume: string;
  is_closed: boolean;
}

interface CandleMessage {
  action: string;
  candles?: Candle[];
  timestamp?: number;
}

interface UseCandlesOptions {
  symbol: string;
  interval: string;
  enabled?: boolean;
}

export const useCandles = ({
  symbol,
  interval,
  enabled = true,
}: UseCandlesOptions) => {
  const [candles, setCandles] = useState<Candle[]>([]);
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
    const wsUrl = `${baseUrl}/ws/candles?symbol=${symbol.replace(
      "_",
      ""
    )}&interval=${interval}&type=spot`;

    console.log(`🔗 Connecting to Candles WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`✅ Candles WebSocket connected for ${symbol} (${interval})`);
      setConnected(true);
      setLoading(false);
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      try {
        const msg: CandleMessage = JSON.parse(data);

        if (
          msg.action === "initial" ||
          msg.action === "update" ||
          msg.action === "trade_update"
        ) {
          if (msg.candles && Array.isArray(msg.candles)) {
            setCandles(msg.candles);
            setLastUpdate(msg.timestamp || Date.now());

            if (msg.action === "trade_update") {
              console.log(
                `📊 Candles update for ${symbol}: ${msg.candles.length} candles`
              );
            }
          }
        }
      } catch (err) {
        console.error("❌ Failed to parse candles message:", err);
        setError("Failed to parse candles data");
      }
    };

    ws.onerror = (event) => {
      console.error("❌ WebSocket error for candles:", event);
      setError("WebSocket connection error");
    };

    ws.onclose = () => {
      console.log(`🔌 Candles WebSocket disconnected for ${symbol}`);
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
  }, [symbol, interval]);

  useEffect(() => {
    if (!enabled || !symbol || !interval) {
      setLoading(false);
      setConnected(false);
      // Close existing connection if disabled
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("🔌 Closing candles WebSocket (disabled)");
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

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
  }, [connect, enabled, symbol, interval]);

  return { candles, loading, error, connected, lastUpdate };
};
