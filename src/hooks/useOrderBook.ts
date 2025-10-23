import { useEffect, useState, useRef } from "react";

export interface OrderBookData {
  asks: Array<{ price: number; quantity: number; total: number }>;
  bids: Array<{ price: number; quantity: number; total: number }>;
  currentPrice: number;
}

// Simple hash function to detect data changes
const hashOrderBook = (data: any): string => {
  if (!data) return "";
  const asks = (data.asks || [])
    .map((a: any) => `${a.price}:${a.quantity}`)
    .join("|");
  const bids = (data.bids || [])
    .map((b: any) => `${b.price}:${b.quantity}`)
    .join("|");
  return `${asks}|${bids}`;
};

export const useOrderBook = (symbol: string = "BTCUSDT") => {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const lastHashRef = useRef<string>("");

  useEffect(() => {
    try {
      console.log(`🔗 Connecting to WebSocket server for ${symbol}...`);

      // Use WSS in production, WS in dev
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setConnected(true);
        setError(null);

        // Subscribe to real-time updates
        ws.send(
          JSON.stringify({
            type: "subscribe",
            symbol: symbol,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "subscribed") {
            console.log(`✅ Subscribed to ${message.symbol}`);
            setLoading(false);
            return;
          }

          if (message.type === "update" && message.data) {
            const data = message.data;
            const currentHash = hashOrderBook(data);

            // Only update if data actually changed
            if (currentHash === lastHashRef.current) {
              return; // Data hasn't changed, skip update
            }

            lastHashRef.current = currentHash;
            console.log(`📊 Order book CHANGED for ${symbol}`);

            // Format: { asks: [{price: string, quantity: string}, ...], bids: [{price: string, quantity: string}, ...] }
            const asks = (data.asks || []).map((item: any) => {
              const price = parseFloat(item.price);
              const quantity = parseFloat(item.quantity);
              return {
                price,
                quantity,
                total: price * quantity,
              };
            });

            const bids = (data.bids || []).map((item: any) => {
              const price = parseFloat(item.price);
              const quantity = parseFloat(item.quantity);
              return {
                price,
                quantity,
                total: price * quantity,
              };
            });

            // Current price = highest bid or lowest ask
            const currentPrice =
              bids.length > 0
                ? bids[0].price
                : asks.length > 0
                ? asks[asks.length - 1].price
                : 0;

            setOrderBook({
              asks,
              bids,
              currentPrice,
            });
          }
        } catch (err) {
          console.error("❌ Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = () => {
        console.error("❌ WebSocket error");
        setError("WebSocket connection error");
        setConnected(false);
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        setConnected(false);
      };

      wsRef.current = ws;

      // Cleanup on unmount - unsubscribe
      return () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "unsubscribe",
              symbol: symbol,
            })
          );
          wsRef.current.close();
        }
      };
    } catch (err) {
      console.error("Error setting up WebSocket:", err);
      setError("Failed to initialize connection");
      setLoading(false);
    }
  }, [symbol]);

  return {
    orderBook,
    loading,
    error,
    connected,
  };
};
