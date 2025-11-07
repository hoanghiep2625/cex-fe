"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useMarketData } from "@/hooks";
import { fmt } from "@/lib/formatters";

interface MarketData {
  price: number;
  [key: string]: unknown;
}

export default function MarketTitleUpdater({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const symbol = useMemo(() => pair.replace("_", ""), [pair]);

  // Fetch market data
  const { data: initialMarketData } = useQuery<MarketData>({
    queryKey: ["marketData", symbol, type],
    queryFn: () =>
      axiosInstance
        .get(`/symbols/market-data/${symbol}`, { params: { type } })
        .then((r) => r.data?.data),
    refetchOnWindowFocus: false,
  });

  // WebSocket market data
  const { marketData: wsMarketData } = useMarketData(symbol, type);
  const marketData = useMemo(() => {
    return (wsMarketData as MarketData | null) || initialMarketData || null;
  }, [wsMarketData, initialMarketData]);

  useEffect(() => {
    if (marketData) {
      const price = fmt(marketData.price);
      const title = `${price} | ${symbol}`;
      document.title = title;
    } else {
      // Default title khi chưa load xong
      const defaultPrice = fmt(100000.99);
      const title = `${defaultPrice} | ${symbol}`;
      document.title = title;
    }
  }, [marketData, symbol]);

  return null;
}
