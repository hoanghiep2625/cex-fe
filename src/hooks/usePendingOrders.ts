import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";

export interface PendingOrder {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  price: string;
  qty: string;
  filled_qty: string;
  remaining_qty: string;
  status: "NEW" | "PARTIALLY_FILLED";
  tif: "GTC" | "FOK" | "IOC";
  client_order_id?: string;
  created_at: string;
  updated_at: string;
}

interface ListenKeyData {
  listenKey: string;
  expiresIn: number;
  expiresAt: string;
}

// LocalStorage keys
const LISTEN_KEY_STORAGE_KEY = "pendingOrders_listenKey";
const LISTEN_KEY_EXPIRY_STORAGE_KEY = "pendingOrders_listenKeyExpiry";

export const usePendingOrders = (
  symbol?: string,
  hideOtherPairs: boolean = false
) => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const listenKeyRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [connected, setConnected] = useState(false);

  // Function to save listenKey to localStorage
  const saveListenKeyToStorage = (
    listenKey: string,
    expiresAt: string
  ): void => {
    try {
      localStorage.setItem(LISTEN_KEY_STORAGE_KEY, listenKey);
      localStorage.setItem(LISTEN_KEY_EXPIRY_STORAGE_KEY, expiresAt);
      console.log(
        `💾 ListenKey saved to localStorage: ${listenKey.substring(0, 8)}...`
      );
    } catch (err) {
      console.error("Failed to save listenKey to localStorage:", err);
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
        console.log("🗑️ ListenKey expired in localStorage, removing...");
        localStorage.removeItem(LISTEN_KEY_STORAGE_KEY);
        localStorage.removeItem(LISTEN_KEY_EXPIRY_STORAGE_KEY);
        return null;
      }

      console.log(
        `📖 ListenKey retrieved from localStorage: ${listenKey.substring(
          0,
          8
        )}...`
      );
      return { listenKey, expiresAt };
    } catch (err) {
      console.error("Failed to get listenKey from localStorage:", err);
      return null;
    }
  };

  // Function to create new listenKey
  const createListenKey = async (): Promise<string | null> => {
    try {
      const response = await axiosInstance.post<any>(
        "/user-sessions/listen-key"
      );
      // Response structure: { statusCode, message, data: { statusCode, message, data: { listenKey, expiresIn, expiresAt } } }
      const listenKeyData: ListenKeyData = response.data?.data?.data;

      if (!listenKeyData?.listenKey) {
        console.error("❌ No listenKey in response:", response.data);
        return null;
      }

      const { listenKey, expiresIn, expiresAt } = listenKeyData;

      console.log(
        `✅ ListenKey created: ${listenKey.substring(
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
      console.error("❌ Failed to create listenKey:", err);
      setError("Failed to create listenKey");
      return null;
    }
  };

  // Function to refresh existing listenKey
  const refreshListenKey = async (
    currentListenKey: string
  ): Promise<string | null> => {
    try {
      const response = await axiosInstance.post<any>(
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
        `✅ ListenKey refreshed: ${listenKey.substring(
          0,
          8
        )}... (expires in ${expiresIn}s)`
      );

      // Save updated listenKey to localStorage
      saveListenKeyToStorage(listenKey, expiresAt);

      // Schedule next refresh
      const refreshTime = (expiresIn - 300) * 1000;
      scheduleRefresh(listenKey, refreshTime);

      return listenKey;
    } catch (err) {
      console.error("❌ Failed to refresh listenKey:", err);
      return null;
    }
  };

  // Function to schedule refresh timer
  const scheduleRefresh = (listenKey: string, refreshTime: number): void => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = setTimeout(async () => {
      console.log("⏰ Time to refresh listenKey...");
      const newListenKey = await refreshListenKey(listenKey);
      if (newListenKey) {
        listenKeyRef.current = newListenKey;
        // Reconnect WebSocket with new listenKey
        connectWebSocket(newListenKey);
      }
    }, refreshTime);
  };

  // Function to connect WebSocket
  const connectWebSocket = (listenKey: string) => {
    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const baseUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        `${protocol}://api-cex.tahoanghiep.com`;
      const wsUrl = `${baseUrl}/ws/orders?listenKey=${listenKey}&symbol=${
        symbol || ""
      }`;

      console.log(`🔗 Connecting WebSocket: ${wsUrl.split("?")[0]}...`);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setLoading(false);
        setConnected(true);
        setError(null);
      };

      ws.onmessage = ({ data }: MessageEvent) => {
        try {
          const msg = JSON.parse(data);

          if (msg.action === "pending_orders" && Array.isArray(msg.orders)) {
            let filteredOrders = msg.orders;

            if (hideOtherPairs && symbol) {
              filteredOrders = filteredOrders.filter(
                (order: PendingOrder) => order.symbol === symbol
              );
            }

            setOrders(filteredOrders);
          }
        } catch (err) {
          console.error("Failed to parse pending orders message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("❌ WebSocket error:", event);
        setError("WebSocket connection error");
      };

      ws.onclose = () => {
        setConnected(false);
        console.log("🔌 WebSocket disconnected");
        // Try to reconnect after 3 seconds
        reconnectTimerRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...");
          connectWebSocket(listenKey);
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
      setError("Failed to connect WebSocket");
    }
  };

  useEffect(() => {
    // Only initialize if user is authenticated (has token)
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // Initialize connection
    const initializeConnection = async () => {
      // Try to get listenKey from localStorage first
      const storedData = getListenKeyFromStorage();

      if (storedData) {
        // Use existing listenKey from localStorage
        const { listenKey, expiresAt } = storedData;
        console.log("🔄 Using existing listenKey from localStorage");

        // Calculate remaining time until expiry
        const remainingTime = new Date(expiresAt).getTime() - Date.now();
        const refreshTime = Math.max(0, remainingTime - 300 * 1000); // Refresh 5 min before expiry

        listenKeyRef.current = listenKey;
        scheduleRefresh(listenKey, refreshTime);
        connectWebSocket(listenKey);
      } else {
        // Create new listenKey
        console.log("🆕 Creating new listenKey...");
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
  }, [symbol, hideOtherPairs]);

  return { orders, loading, error, connected };
};
