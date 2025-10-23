import { useEffect, useState, useRef } from "react";

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
}

export const useMarketData = (
  symbol: string = "BTCUSDT",
  type: string = "spot"
) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL || `${protocol}://api-cex.tahoanghiep.com`;
    const wsUrl = `${baseUrl}/ws/market-data?symbol=${symbol}&type=${type}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setLoading(false);
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      try {
        const msg: BackendMarketDataMessage = JSON.parse(data);
        if (msg.data) {
          setMarketData(msg.data);
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
      console.log("❌ Disconnected from market data WebSocket");
    };

    wsRef.current = ws;

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [symbol, type]);

  return { marketData, loading, error, connected };
};
