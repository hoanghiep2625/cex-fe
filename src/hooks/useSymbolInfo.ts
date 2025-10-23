import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

export interface SymbolInfo {
  id: number;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  name?: string;
}

export const useSymbolInfo = (symbol: string) => {
  const [symbolInfo, setSymbolInfo] = useState<SymbolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    const fetchSymbolInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/symbols/code/${symbol}`);
        const data = response.data.data || response.data;
        setSymbolInfo(data);
      } catch (err) {
        console.error(`❌ Error fetching symbol info for ${symbol}:`, err);
        setError("Failed to fetch symbol info");
      } finally {
        setLoading(false);
      }
    };

    fetchSymbolInfo();
  }, [symbol]);

  return { symbolInfo, loading, error };
};
