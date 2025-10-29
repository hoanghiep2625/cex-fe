import { useState, useEffect, useRef } from "react";

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
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL || `${protocol}://api-cex.tahoanghiep.com`;
    const wsUrl = `${baseUrl}/ws/ticker?quote_asset=${quoteAsset}&type=${type}`;

    console.log(`🔗 Connecting to Ticker WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Ticker WebSocket connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (
          message.action === "initial" ||
          message.action === "update" ||
          message.action === "trade_update"
        ) {
          console.log(
            `📊 Ticker ${message.action}:`,
            message.data?.length,
            "symbols"
          );
          setTickers(message.data || []);
        }
      } catch (error) {
        console.error("❌ Error parsing ticker message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ Ticker WebSocket error:", error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("🔌 Ticker WebSocket disconnected");
      setConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [quoteAsset, type]);

  return { tickers, connected };
}
