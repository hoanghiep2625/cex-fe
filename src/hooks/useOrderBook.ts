import { useEffect, useState, useRef } from "react";

export interface OrderBookData {
  asks: Array<{ price: number; quantity: number; total: number }>;
  bids: Array<{ price: number; quantity: number; total: number }>;
  currentPrice: number;
}

interface BackendLevel {
  price: string;
  quantity: string;
}

interface BackendOrderBook {
  symbol: string;
  bids: BackendLevel[];
  asks: BackendLevel[];
  timestamp: number;
}

export const useOrderBook = (symbol: string = "BTCUSDT") => {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const hashRef = useRef("");

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL || `${protocol}://api-cex.tahoanghiep.com`;
    const wsUrl = `${baseUrl}/ws?symbol=${symbol}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setLoading(false);
      ws.send(JSON.stringify({ symbol }));
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      const msg: { symbol: string; orderBook: BackendOrderBook } =
        JSON.parse(data);
      if (msg.orderBook) {
        const hash = JSON.stringify([msg.orderBook.asks, msg.orderBook.bids]);
        if (hash === hashRef.current) return;
        hashRef.current = hash;

        interface Level {
          price: string;
          quantity: string;
        }

        const parseLevel = (p: Level) => ({
          price: +p.price,
          quantity: +p.quantity,
          total: +p.price * +p.quantity,
        });

        const { asks, bids } = msg.orderBook;
        setOrderBook({
          asks: asks.map(parseLevel),
          bids: bids.map(parseLevel),
          currentPrice: bids.length
            ? +bids[0].price
            : asks.length
            ? +asks[asks.length - 1].price
            : 0,
        });
      }
    };

    ws.onerror = () => setError("WS Error");
    ws.onclose = () => setConnected(false);

    wsRef.current = ws;

    return () => {
      try {
        ws.send(JSON.stringify({ symbol, unsubscribe: true }));
      } catch {}
      ws.close();
    };
  }, [symbol]);

  return { orderBook, loading, error, connected };
};
