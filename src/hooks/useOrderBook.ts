import { useEffect, useState, useRef, useCallback } from "react";

export interface OrderBookData {
  asks: Array<{
    price: number;
    quantity: number;
    total: number;
    percentage: number;
  }>;
  bids: Array<{
    price: number;
    quantity: number;
    total: number;
    percentage: number;
  }>;
  currentPrice: number;
}

interface BackendLevel {
  price: string;
  quantity: string;
  total: number;
  percentage: number;
}

interface BackendOrderBook {
  symbol: string;
  bids: BackendLevel[];
  asks: BackendLevel[];
  action?: string;
  timestamp?: number;
}

export const useOrderBook = (
  symbol: string = "BTCUSDT",
  type: string = "spot"
) => {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const hashRef = useRef("");
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldConnectRef = useRef(true);

  const connect = useCallback(() => {
    // Cleanup existing connection
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ symbol, unsubscribe: true }));
      } catch {}
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL || `${protocol}://api-cex.tahoanghiep.com`;
    const wsUrl = `${baseUrl}/ws?symbol=${symbol}&type=${type}`;

    console.log(`🔗 Connecting to OrderBook WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`✅ OrderBook WebSocket connected for ${symbol}`);
      setConnected(true);
      setLoading(false);
      setError(null);
      reconnectAttemptsRef.current = 0;
      ws.send(JSON.stringify({ symbol }));
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      try {
        const msg: { symbol: string; orderBook: BackendOrderBook } =
          JSON.parse(data);
        if (msg.orderBook) {
          const hash = JSON.stringify([msg.orderBook.asks, msg.orderBook.bids]);
          if (hash === hashRef.current) return;
          hashRef.current = hash;

          const parseLevel = (p: BackendLevel) => ({
            price: +p.price,
            quantity: +p.quantity,
            total: p.total || +p.price * +p.quantity,
            percentage: p.percentage || 0,
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
          setLastUpdate(msg.orderBook.timestamp || Date.now());

          if (msg.orderBook.action === "update") {
            console.log(`📊 OrderBook update for ${symbol}`);
          }
        }
      } catch (err) {
        console.error("❌ Failed to parse orderbook message:", err);
        setError("Failed to parse orderbook data");
      }
    };

    ws.onerror = (event) => {
      console.error("❌ WebSocket error for orderbook:", event);
      setError("WebSocket connection error");
    };

    ws.onclose = () => {
      console.log(`🔌 OrderBook WebSocket disconnected for ${symbol}`);
      setConnected(false);

      // Only reconnect if shouldConnectRef is true
      if (!shouldConnectRef.current) {
        console.log("🚫 Reconnect disabled, not reconnecting");
        return;
      }

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
    shouldConnectRef.current = true;
    connect();

    return () => {
      // Disable reconnect on cleanup
      shouldConnectRef.current = false;
      // Cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        try {
          wsRef.current.send(JSON.stringify({ symbol, unsubscribe: true }));
        } catch {}
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, symbol]);

  return { orderBook, loading, error, connected, lastUpdate };
};
