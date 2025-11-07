import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";

export function useListenKey() {
  const [listenKey, setListenKey] = useState<string | undefined>(undefined);
  const [listenKeyFetched, setListenKeyFetched] = useState(false);

  const fetchListenKey = useCallback(async (forceRefresh = false) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setListenKeyFetched(true);
      return;
    }

    if (!forceRefresh) {
      const storedKey = localStorage.getItem("listenKey");
      const storedExpiresAt = localStorage.getItem("listenKeyExpiresAt");

      if (storedKey && storedExpiresAt) {
        const expiresAt = new Date(storedExpiresAt);
        const now = new Date();
        // Check if still valid (not expired)
        if (expiresAt > now) {
          setListenKey(storedKey);
          setListenKeyFetched(true);
          return;
        }
        // Expired, remove old data
        localStorage.removeItem("listenKey");
        localStorage.removeItem("listenKeyExpiresAt");
      }
    }

    // Fetch new listenKey
    try {
      const response = await axiosInstance.post("/user-sessions/listen-key");
      const listenKeyData =
        response.data?.data?.data || response.data?.data || response.data;
      const key = listenKeyData?.listenKey;
      const expiresAt = listenKeyData?.expiresAt;

      if (key && expiresAt) {
        localStorage.setItem("listenKey", key);
        localStorage.setItem("listenKeyExpiresAt", expiresAt);
        setListenKey(key);
      }
    } catch (error) {
      console.error("[useListenKey] Error fetching listenKey:", error);
    } finally {
      setListenKeyFetched(true);
    }
  }, []);

  useEffect(() => {
    fetchListenKey();

    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        if (e.newValue) {
          // login ở tab khác
          const currentListenKey = localStorage.getItem("listenKey");
          if (!currentListenKey) {
            fetchListenKey(true);
          }
        } else {
          // logout ở tab khác
          localStorage.removeItem("listenKey");
          localStorage.removeItem("listenKeyExpiresAt");
          setListenKey(undefined);
        }
      }
    };

    // Listen for user-login event (when user logs in from same tab)
    const handleLogin = () => {
      const accessToken = localStorage.getItem("accessToken");
      const currentListenKey = localStorage.getItem("listenKey");
      if (accessToken && !currentListenKey) {
        fetchListenKey(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-login", handleLogin);

    // Check and refresh listenKey every minute
    const refreshInterval = setInterval(() => {
      const storedExpiresAt = localStorage.getItem("listenKeyExpiresAt");
      if (storedExpiresAt) {
        const expiresAt = new Date(storedExpiresAt);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        // Refresh if expired or will expire in less than 5 minutes
        if (timeUntilExpiry <= 5 * 60 * 1000) {
          fetchListenKey(true);
        }
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-login", handleLogin);
      clearInterval(refreshInterval);
    };
  }, [fetchListenKey]);

  return { listenKey, listenKeyFetched, fetchListenKey };
}
