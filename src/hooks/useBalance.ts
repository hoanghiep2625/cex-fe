import { useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";

export interface Asset {
  code: string;
  precision: number;
  created_at: string;
}

export interface Balance {
  id: string;
  user_id: number;
  currency: string;
  wallet_type: string;
  available: string;
  locked: string;
  created_at: string;
  updated_at: string;
  asset: Asset;
}

export const useBalance = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setBalanceLoading(true);
      setBalanceError(null);

      const response = await axiosInstance.get("/balance");
      const data = response.data?.data || response.data;

      if (Array.isArray(data)) {
        setBalances(data);
      } else {
        console.warn("Balance response is not an array:", data);
        setBalances([]);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalanceError("Failed to fetch balance");
      setBalances([]);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  return {
    balances,
    balanceLoading,
    balanceError,
    fetchBalance,
  };
};
