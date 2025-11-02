import { useState, useEffect, useRef, useCallback } from "react";

export interface TickerSymbol {
  symbol: string;
  base_asset: string;
  quote_asset: string;
  price: number;
  priceChangePercent24h: number;
}

interface UseTickerOptions {
  quoteAsset?: string;
  type?: string;
  heartbeatMs?: number; // ping định kỳ
  staleThresholdMs?: number; // nếu quá lâu không nhận được msg -> close để reconnect
  maxReconnectAttempts?: number; // set Infinity nếu muốn retry vô hạn
  baseDelayMs?: number; // backoff base
  throttleMs?: number; // giảm tần suất setState
}

type TimeoutRef = ReturnType<typeof setTimeout> | null;
type IntervalRef = ReturnType<typeof setInterval> | null;

export function useTicker({
  quoteAsset = "USDT",
  type = "spot",
  heartbeatMs = 20000,
  staleThresholdMs = 40000,
  maxReconnectAttempts = Infinity,
  baseDelayMs = 1000,
  throttleMs = 120,
}: UseTickerOptions = {}) {
  const [tickers, setTickers] = useState<TickerSymbol[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<TimeoutRef>(null);
  const heartbeatIntervalRef = useRef<IntervalRef>(null);
  const staleCheckIntervalRef = useRef<IntervalRef>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldConnectRef = useRef(true);

  // throttle buffer để hạn chế setState liên tục
  const bufferRef = useRef<TickerSymbol[] | null>(null);
  const throttleTimerRef = useRef<TimeoutRef>(null);

  const clearTimers = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (staleCheckIntervalRef.current) {
      clearInterval(staleCheckIntervalRef.current);
      staleCheckIntervalRef.current = null;
    }
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
  };

  const safeSetTickers = (data: TickerSymbol[], ts: number) => {
    // gom các update trong throttleMs
    bufferRef.current = data;
    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        if (bufferRef.current) {
          setTickers(bufferRef.current);
          setLastUpdate(ts);
          bufferRef.current = null;
        }
        throttleTimerRef.current = null;
      }, throttleMs);
    }
  };

  const buildWsUrl = () => {
    const isHttps =
      typeof window !== "undefined" && window.location.protocol === "https:";
    const protocol = isHttps ? "wss" : "ws";
    const envUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();
    const baseUrl =
      envUrl && /^wss?:\/\//i.test(envUrl)
        ? envUrl
        : `${protocol}://${envUrl || "api-cex.tahoanghiep.com"}`;
    return `${baseUrl.replace(
      /\/+$/,
      ""
    )}/ws/ticker?quote_asset=${encodeURIComponent(
      quoteAsset
    )}&type=${encodeURIComponent(type)}`;
  };

  const connect = useCallback(() => {
    // cleanup socket cũ
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    clearTimers();

    const wsUrl = buildWsUrl();
    console.log(`🔗 Connecting to Ticker WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Ticker WebSocket connected");
      setConnected(true);
      setLoading(false);
      setError(null);
      reconnectAttemptsRef.current = 0;

      // Heartbeat: ping định kỳ để giữ kết nối & phát hiện treo
      heartbeatIntervalRef.current = setInterval(() => {
        try {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current?.send(
              JSON.stringify({ type: "ping", ts: Date.now() })
            );
          }
        } catch {}
      }, heartbeatMs);

      // Stale detector: nếu quá lâu không có message -> tự đóng để trigger reconnect
      staleCheckIntervalRef.current = setInterval(() => {
        if (!lastUpdate) return;
        if (Date.now() - lastUpdate > staleThresholdMs) {
          console.warn("⏱️ Stale connection detected. Forcing reconnect.");
          try {
            wsRef.current?.close();
          } catch {}
        }
      }, Math.min(staleThresholdMs, 5000));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (
          message.action === "initial" ||
          message.action === "update" ||
          message.action === "trade_update"
        ) {
          safeSetTickers(message.data || [], message.timestamp || Date.now());
          if (message.action === "trade_update") {
            // optional log nhẹ
            // console.log(`📊 ${message.data?.length ?? 0} symbols updated`);
          }
        } else if (message.type === "pong") {
          // server có thể trả pong
        }
      } catch (err) {
        console.error("❌ Error parsing ticker message:", err);
        setError("Failed to parse ticker data");
      }
    };

    ws.onerror = (event) => {
      console.error("❌ Ticker WebSocket error:", event);
      setError("WebSocket connection error");
    };

    ws.onclose = () => {
      console.log("🔌 Ticker WebSocket disconnected");
      setConnected(false);
      clearTimers();

      if (!shouldConnectRef.current) {
        console.log("🚫 Reconnect disabled, not reconnecting");
        return;
      }
      // Chờ có mạng rồi mới reconnect nhanh
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        console.warn("📴 Offline detected. Waiting for online to reconnect…");
        const handleOnline = () => {
          window.removeEventListener("online", handleOnline);
          scheduleReconnect();
        };
        window.addEventListener("online", handleOnline);
        return;
      }

      scheduleReconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteAsset, type, heartbeatMs, staleThresholdMs]);

  const scheduleReconnect = useCallback(() => {
    if (!shouldConnectRef.current) return;

    const attempt = reconnectAttemptsRef.current;
    if (attempt >= maxReconnectAttempts) {
      setError("Failed to connect after multiple attempts");
      return;
    }

    // exponential backoff + jitter
    const jitter = Math.random() * 300;
    const delay = Math.min(30000, baseDelayMs * Math.pow(2, attempt)) + jitter;

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect();
    }, delay);
  }, [baseDelayMs, maxReconnectAttempts, connect]);

  // Khởi tạo & cleanup
  useEffect(() => {
    shouldConnectRef.current = true;
    setLoading(true);
    connect();

    const handleOffline = () => {
      // đóng nhanh khi mất mạng
      try {
        wsRef.current?.close();
      } catch {}
    };
    window.addEventListener("offline", handleOffline);

    return () => {
      shouldConnectRef.current = false;
      window.removeEventListener("offline", handleOffline);
      clearTimers();
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, [connect]);

  // tiện ích
  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const reconnectNow = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    clearTimers();
    try {
      wsRef.current?.close();
    } catch {}
    connect();
  }, [connect]);

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    clearTimers();
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    setConnected(false);
  }, []);

  return {
    tickers,
    connected,
    loading,
    error,
    lastUpdate,
    send,
    reconnectNow,
    disconnect,
  };
}
