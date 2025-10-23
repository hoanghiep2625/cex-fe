"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import axiosInstance from "@/lib/axiosInstance";

export interface SymbolData {
  id: string;
  code: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  basePrecision: number;
  quotePrecision: number;
  minNotional: string;
  minQty: string;
  maxQty: string;
  stepSize: string;
  tickSize: string;
  status: string;
}

interface SymbolContextType {
  symbol: SymbolData | null;
  loading: boolean;
  error: string | null;
  fetchSymbol: (code: string, type: string) => Promise<void>;
}

const SymbolContext = createContext<SymbolContextType | undefined>(undefined);

export const SymbolProvider = ({ children }: { children: ReactNode }) => {
  const [symbol, setSymbol] = useState<SymbolData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSymbol = useCallback(
    async (code: string, type: string = "spot") => {
      try {
        setLoading(true);
        setError(null);

        // Convert pair format: "BTC_USDT" → "BTCUSDT"
        const symbolCode = code.replace("_", "");

        // Call API: /symbols/BTCUSDT/spot
        const response = await axiosInstance.get(
          `/symbols/${symbolCode}/${type}`
        );
        const data = response.data?.data || response.data;

        setSymbol(data);
        console.log(`✅ Symbol ${symbolCode}/${type} fetched:`, data);
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } } | undefined;
        const errorMsg =
          error?.response?.data?.message || "Failed to fetch symbol";
        setError(errorMsg);
        console.error(`❌ Error fetching symbol ${code}/${type}:`, err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <SymbolContext.Provider value={{ symbol, loading, error, fetchSymbol }}>
      {children}
    </SymbolContext.Provider>
  );
};

export const useSymbol = () => {
  const context = useContext(SymbolContext);
  if (context === undefined) {
    throw new Error("useSymbol must be used within SymbolProvider");
  }
  return context;
};
