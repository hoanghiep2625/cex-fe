import { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";

export interface BalanceData {
  currency: string;
  available: string;
  locked: string;
  total: string;
}

export interface BalanceInfo {
  [key: string]: BalanceData; // { BTC: {...}, USDT: {...} }
}

interface ListenKeyData {
  listenKey: string;
  expiresIn: number;
  expiresAt: string;
}

// LocalStorage keys
const LISTEN_KEY_STORAGE_KEY = "listenKey";
const LISTEN_KEY_EXPIRY_STORAGE_KEY = "listenKeyExpiry";

export const useBalance = (symbol: string, walletType: string = "spot") => {
  const [balances, setBalances] = useState<BalanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const listenKeyRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [connected, setConnected] = useState(false);
  const shouldConnectRef = useRef(true);

  // Function to save listenKey to localStorage
  const saveListenKeyToStorage = (
    listenKey: string,
    expiresAt: string
  ): void => {
    try {
      localStorage.setItem(LISTEN_KEY_STORAGE_KEY, listenKey);
      localStorage.setItem(LISTEN_KEY_EXPIRY_STORAGE_KEY, expiresAt);
      console.log(
        `💾 Balance ListenKey saved to localStorage: ${listenKey.substring(
          0,
          8
        )}...`
      );
    } catch (err) {
      console.error("Failed to save balance listenKey to localStorage:", err);
    }
  };

  // Function to get listenKey from localStorage
  const getListenKeyFromStorage = (): {
    listenKey: string;
    expiresAt: string;
  } | null => {
    try {
      const listenKey = localStorage.getItem(LISTEN_KEY_STORAGE_KEY);
      const expiresAt = localStorage.getItem(LISTEN_KEY_EXPIRY_STORAGE_KEY);

      if (!listenKey || !expiresAt) {
        return null;
      }

      // Check if already expired
      if (new Date(expiresAt) <= new Date()) {
        console.log(
          "🗑️ Balance ListenKey expired in localStorage, removing..."
        );
        localStorage.removeItem(LISTEN_KEY_STORAGE_KEY);
        localStorage.removeItem(LISTEN_KEY_EXPIRY_STORAGE_KEY);
        return null;
      }

      return { listenKey, expiresAt };
    } catch (err) {
      console.error("Failed to get balance listenKey from localStorage:", err);
      return null;
    }
  };

  // Function to refresh existing listenKey - wrapped in useCallback
  const refreshListenKey = useCallback(
    async (currentListenKey: string): Promise<ListenKeyData | null> => {
      try {
        const response = await axiosInstance.post(
          `/user-sessions/listen-key/${currentListenKey}/refresh`
        );
        // Response structure: same as create
        const listenKeyData: ListenKeyData = response.data?.data?.data;

        if (!listenKeyData?.listenKey) {
          console.error("❌ No listenKey in refresh response:", response.data);
          return null;
        }

        const { listenKey, expiresIn, expiresAt } = listenKeyData;

        console.log(
          `✅ Balance ListenKey refreshed: ${listenKey.substring(
            0,
            8
          )}... (expires in ${expiresIn}s)`
        );

        // Save updated listenKey to localStorage
        saveListenKeyToStorage(listenKey, expiresAt);

        return { listenKey, expiresIn, expiresAt };
      } catch (err) {
        console.error("❌ Failed to refresh balance listenKey:", err);
        return null;
      }
    },
    []
  );

  // Function to connect WebSocket with exponential backoff
  const connectWebSocket = useCallback(
    (listenKey: string, reconnectAttempt: number = 0) => {
      try {
        // Close existing connection
        if (wsRef.current) {
          wsRef.current.close();
        }

        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const baseUrl =
          process.env.NEXT_PUBLIC_WS_URL ||
          `${protocol}://api-cex.tahoanghiep.com`;
        const wsUrl = `${baseUrl}/ws/balance?listenKey=${listenKey}&symbol=${symbol}&wallet_type=${walletType}`;

        console.log(`🔗 Connecting to Balance WebSocket: ${wsUrl}`);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("✅ Balance WebSocket connected");
          setLoading(false);
          setConnected(true);
          setError(null);
        };

        ws.onmessage = ({ data }: MessageEvent) => {
          try {
            const msg = JSON.parse(data);

            if (msg.action === "initial" || msg.action === "update") {
              if (msg.balances) {
                setBalances(msg.balances);
                console.log(
                  `📊 Balance update: ${Object.keys(msg.balances).join(", ")}`
                );
              }
            } else if (msg.error) {
              console.error("❌ Balance WebSocket error:", msg.error);
              setError(msg.error);
            }
          } catch (err) {
            console.error("❌ Failed to parse balance message:", err);
            setError("Failed to parse balance data");
          }
        };

        ws.onerror = (event) => {
          console.error("❌ Balance WebSocket error:", event);
          setError("WebSocket connection error");
        };

        ws.onclose = () => {
          console.log("🔌 Balance WebSocket disconnected");
          setConnected(false);

          if (!shouldConnectRef.current) {
            console.log("🚫 Reconnect disabled, not reconnecting");
            return;
          }

          // Auto-reconnect with exponential backoff
          const maxAttempts = 5;
          const baseDelay = 1000;

          if (reconnectAttempt < maxAttempts) {
            const delay = baseDelay * Math.pow(2, reconnectAttempt);
            console.log(
              `🔄 Reconnecting in ${delay}ms (attempt ${
                reconnectAttempt + 1
              }/${maxAttempts})...`
            );

            reconnectTimerRef.current = setTimeout(() => {
              connectWebSocket(listenKey, reconnectAttempt + 1);
            }, delay);
          } else {
            setError("Failed to connect after multiple attempts");
          }
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("❌ Failed to connect Balance WebSocket:", err);
        setError("Failed to connect WebSocket");
      }
    },
    [symbol, walletType]
  );

  // Function to send refresh message to WebSocket
  const refresh = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: "refresh",
          timestamp: Date.now(),
        })
      );
      console.log("🔄 Sent refresh request to Balance WebSocket");
    }
  }, []);

  useEffect(() => {
    // Only initialize if user is authenticated (has token)
    const token = localStorage.getItem("accessToken");
    if (!token) {
      shouldConnectRef.current = false;
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    shouldConnectRef.current = true;

    // Define scheduleRefresh inside useEffect to avoid circular dependencies
    const scheduleRefresh = (listenKey: string, refreshTime: number): void => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = setTimeout(async () => {
        console.log("⏰ Time to refresh balance listenKey...");
        const result = await refreshListenKey(listenKey);
        if (result) {
          const { listenKey: newListenKey, expiresIn } = result;
          listenKeyRef.current = newListenKey;
          // Schedule next refresh
          const nextRefreshTime = (expiresIn - 300) * 1000;
          scheduleRefresh(newListenKey, nextRefreshTime);
          // Reconnect WebSocket with new listenKey
          connectWebSocket(newListenKey);
        }
      }, refreshTime);
    };

    // Define createListenKey inside useEffect to avoid circular dependencies
    const createListenKey = async (): Promise<string | null> => {
      try {
        const response = await axiosInstance.post("/user-sessions/listen-key");
        const listenKeyData: ListenKeyData = response.data?.data?.data;

        if (!listenKeyData?.listenKey) {
          console.error("❌ No listenKey in response:", response.data);
          return null;
        }

        const { listenKey, expiresIn, expiresAt } = listenKeyData;

        console.log(
          `✅ Balance ListenKey created: ${listenKey.substring(
            0,
            8
          )}... (expires in ${expiresIn}s)`
        );

        // Save to localStorage
        saveListenKeyToStorage(listenKey, expiresAt);

        // Set up refresh timer (refresh 5 minutes before expiration)
        const refreshTime = (expiresIn - 300) * 1000; // 5 minutes before expiry
        scheduleRefresh(listenKey, refreshTime);

        return listenKey;
      } catch (err) {
        console.error("❌ Failed to create balance listenKey:", err);
        setError("Failed to create listenKey");
        return null;
      }
    };

    // Initialize connection
    const initializeConnection = async () => {
      const storedData = getListenKeyFromStorage();

      if (storedData) {
        const { listenKey, expiresAt } = storedData;
        const remainingTime = new Date(expiresAt).getTime() - Date.now();
        const refreshTime = Math.max(0, remainingTime - 300 * 1000); // Refresh 5 min before expiry

        listenKeyRef.current = listenKey;
        scheduleRefresh(listenKey, refreshTime);
        connectWebSocket(listenKey);
      } else {
        const listenKey = await createListenKey();
        if (listenKey) {
          listenKeyRef.current = listenKey;
          connectWebSocket(listenKey);
        }
      }
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      shouldConnectRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [symbol, walletType, connectWebSocket, refreshListenKey]);

  return { balances, loading, error, connected, refresh };
};
