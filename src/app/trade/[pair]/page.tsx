"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSymbol } from "@/context/SymbolContext";
import MenuBar from "@/components/MenuBar";
import OrderBook from "@/components/OrderBook";
import MarketHeader from "@/components/MarketHeader";
import TradingPairListPanel from "@/components/TradingPairListPanel";
import RecentTrades from "@/components/RecentTrades";
import OrderEntryPanel from "@/components/OrderEntryPanel";
import ChartPanel from "@/components/ChartPanel";
import GlobalStatusBar from "@/components/GlobalStatusBar";
import UserOrderManagementPanel from "@/components/UserOrderManagementPanel";

export default function TradePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const pair = params.pair as string; // e.g., "BTC_USDT"
  const type = searchParams.get("type") || "spot"; // Default to "spot"

  const { fetchSymbol } = useSymbol();

  // Fetch symbol data khi pair hoặc type thay đổi
  useEffect(() => {
    if (pair) {
      fetchSymbol(pair, type);
    }
  }, [pair, type, fetchSymbol]);

  return (
    <div>
      <MenuBar />
      <div className="flex min-h-[900px] gap-1 mt-1 mx-1">
        {/* <div className="bg-red-500 w-full h-15"></div> */}
        <div className="flex-6 gap-1 flex flex-col">
          <MarketHeader pair={pair} type={type} />
          <div className="flex-1 flex gap-1">
            <OrderBook pair={pair} type={type} />
            <div className="flex-[2.5] flex flex-col gap-1">
              <ChartPanel pair={pair} />
              <OrderEntryPanel pair={pair} type={type} />
            </div>
          </div>
        </div>
        <div className="flex-[1.7] h-[1005px] flex flex-col gap-1">
          <TradingPairListPanel />
          <RecentTrades pair={pair} />
        </div>
      </div>
      <UserOrderManagementPanel pair={pair} />
      <GlobalStatusBar />
    </div>
  );
}
