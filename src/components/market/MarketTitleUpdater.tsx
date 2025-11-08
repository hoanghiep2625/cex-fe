"use client";

import { useEffect, useMemo } from "react";
import { fmt } from "@/lib/formatters";
import { MarketData } from "@/types";

export default function MarketTitleUpdater({
  pair,
  marketData,
}: {
  pair: string;
  type: string;
  marketData: MarketData;
}) {
  const symbol = useMemo(() => pair.replace("_", ""), [pair]);

  useEffect(() => {
    if (marketData) {
      const price = fmt(marketData.price);
      const title = `${price} | ${symbol}`;
      document.title = title;
    } else {
      const defaultPrice = fmt(100000.99);
      const title = `${defaultPrice} | ${symbol}`;
      document.title = title;
    }
  }, [marketData, symbol]);

  return null;
}
