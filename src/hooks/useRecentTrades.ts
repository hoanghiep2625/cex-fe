import { useEffect, useState, useRef } from "react";

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
}

export const useRecentTrades = (symbol: string = "BTCUSDT") => {
  const [trades, setTrades] = useState<RecentTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL || `${protocol}://api-cex.tahoanghiep.com`;
    const wsUrl = `${baseUrl}/ws/trades?symbol=${symbol}`;

    console.log(`[RecentTrades] Connecting to: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setLoading(false);
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      try {
        const msg: BackendRecentTrades = JSON.parse(data);
        if (msg.trades && Array.isArray(msg.trades)) {
          setTrades(msg.trades);
        }
      } catch (err) {
        console.error("❌ Failed to parse trades message:", err);
      }
    };

    ws.onerror = (event) => {
      setError("WebSocket Error");
      console.error("❌ WebSocket error for recent trades:", event);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("❌ Disconnected from recent trades WebSocket");
    };

    wsRef.current = ws;

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [symbol]);

  return { trades, loading, error, connected };
};
