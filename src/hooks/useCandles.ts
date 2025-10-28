import { useState, useEffect, useRef } from "react";

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
  const wsRef = useRef<WebSocket | null>(null);

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

    // Prevent reconnecting if already connected to same URL
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("⏭️ Already connected to candles WebSocket");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL || `${protocol}://api-cex.tahoanghiep.com`;
    const wsUrl = `${baseUrl}/ws/candles?symbol=${symbol.replace(
      "_",
      ""
    )}&interval=${interval}&type=spot`;

    console.log("📡 Connecting to candles WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ Connected to candles WebSocket");
      setConnected(true);
      setLoading(false);
      setError(null);
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      try {
        const msg = JSON.parse(data);

        if (msg.action === "initial" || msg.action === "update") {
          if (msg.candles && Array.isArray(msg.candles)) {
            setCandles(msg.candles);
            console.log(
              `📊 Received ${msg.candles.length} candles (${msg.action})`
            );
          }
        }
      } catch (err) {
        console.error("❌ Failed to parse candles message:", err);
      }
    };

    ws.onerror = (event) => {
      console.error("❌ WebSocket error for candles:", event);
      setError("WebSocket Error");
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("🔌 Disconnected from candles WebSocket");
      setConnected(false);
    };

    wsRef.current = ws;

    return () => {
      console.log("🧹 Cleanup: Closing candles WebSocket");
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        try {
          ws.close();
        } catch (err) {
          console.error("Error closing WebSocket:", err);
        }
      }
    };
  }, [symbol, interval, enabled]);

  return { candles, loading, error, connected };
};
