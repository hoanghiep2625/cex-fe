import { useEffect, useState } from "react";
import { useWebSocketContext } from "@/context/WebSocketContext";

interface WebSocketMessage {
  channel: string;
  action: string;
  data?: unknown;
  [key: string]: unknown;
}

export { useWebSocketContext as useWebSocket } from "@/context/WebSocketContext";

export function useOrderBook(symbol: string, type = "spot") {
  const [orderBook, setOrderBook] = useState<Record<string, unknown> | null>(
    null
  );
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    if (!symbol) return;
    return subscribe("orderbook", { symbol, type }, (msg: WebSocketMessage) => {
      if (msg.action === "update")
        setOrderBook(msg.data as Record<string, unknown> | null);
    });
  }, [symbol, type, subscribe]);

  return { orderBook };
}

export function useRecentTrades(symbol: string, limit = 50) {
  const [trades, setTrades] = useState<unknown[]>([]);
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    if (!symbol) return;
    return subscribe(
      "recenttrades",
      { symbol, limit },
      (msg: WebSocketMessage) => {
        if (msg.action === "update") setTrades((msg.data as unknown[]) || []);
      }
    );
  }, [symbol, limit, subscribe]);

  return { trades };
}

export function useMarketData(symbol: string, type = "spot") {
  const [marketData, setMarketData] = useState<Record<string, unknown> | null>(
    null
  );
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    if (!symbol) return;
    return subscribe(
      "marketdata",
      { symbol, type },
      (msg: WebSocketMessage) => {
        if (msg.action === "update")
          setMarketData(msg.data as Record<string, unknown> | null);
      }
    );
  }, [symbol, type, subscribe]);

  return { marketData };
}

export function useCandles(
  symbol: string,
  interval = "1m",
  type = "spot",
  limit = 500
) {
  const [candles, setCandles] = useState<unknown[]>([]);
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    if (!symbol) return;
    return subscribe(
      "candles",
      { symbol, interval, type, limit },
      (msg: WebSocketMessage) => {
        if (msg.action === "update") setCandles((msg.data as unknown[]) || []);
      }
    );
  }, [symbol, interval, type, limit, subscribe]);

  return { candles };
}

export function useTicker(quote_asset = "USDT", type = "spot") {
  const [tickers, setTickers] = useState<unknown[]>([]);
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    return subscribe(
      "ticker",
      { quote_asset, type },
      (msg: WebSocketMessage) => {
        if (msg.action === "update") setTickers((msg.data as unknown[]) || []);
      }
    );
  }, [quote_asset, type, subscribe]);

  return { tickers };
}

export function useGlobalTicker(type = "spot") {
  const [tickers, setTickers] = useState<unknown[]>([]);
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    return subscribe("globalticker", { type }, (msg: WebSocketMessage) => {
      if (msg.action === "update") setTickers((msg.data as unknown[]) || []);
    });
  }, [type, subscribe]);

  return { tickers };
}

export function useBalance(symbol: string, wallet_type = "FUNDING") {
  const [balances, setBalances] = useState<Record<string, unknown> | null>(
    null
  );
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    if (!symbol) return;
    return subscribe(
      "balance",
      { symbol, wallet_type },
      (msg: WebSocketMessage) => {
        if (msg.action === "update")
          setBalances(msg.data as Record<string, unknown> | null);
      }
    );
  }, [symbol, wallet_type, subscribe]);

  return { balances };
}

export function usePendingOrders(symbol?: string) {
  const [orders, setOrders] = useState<unknown[]>([]);
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    return subscribe("orders", { symbol }, (msg: WebSocketMessage) => {
      if (msg.action === "update") setOrders((msg.data as unknown[]) || []);
    });
  }, [symbol, subscribe]);

  return { orders, total: orders.length };
}
