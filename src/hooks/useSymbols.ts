import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

export interface Symbol {
  id: number;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  price?: number;
  change?: number;
}

export const useSymbols = (quoteAsset: string = "USDT") => {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get("/symbols", {
          params: {
            quote_asset: quoteAsset,
            status: "TRADING",
          },
        });
        // Handle nested response: { statusCode, message, data: { data: [...] } }
        const data =
          response.data?.data?.data || response.data?.data || response.data;
        setSymbols(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(`❌ Error fetching symbols for ${quoteAsset}:`, err);
        setError("Failed to fetch symbols");
        setSymbols([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSymbols();
  }, [quoteAsset]);

  return { symbols, loading, error };
};
