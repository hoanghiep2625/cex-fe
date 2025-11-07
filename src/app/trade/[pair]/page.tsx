"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSymbol } from "@/context/SymbolContext";
import MenuBar from "@/components/common/MenuBar";
import OrderBook from "@/components/orderbook/OrderBook";
import MarketHeader from "@/components/market/MarketHeader";
import TradingPairListPanel from "@/components/market/TradingPairListPanel";
import RecentTrades from "@/components/market/RecentTrades";
import OrderEntryPanel from "@/components/trading/OrderEntryPanel";
import ChartPanel from "@/components/chart/ChartPanel";
import GlobalStatusBar from "@/components/common/GlobalStatusBar";
import UserOrderManagementPanel from "@/components/trading/UserOrderManagementPanel";
import MarketTitleUpdater from "@/components/market/MarketTitleUpdater";

export default function TradePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const pair = params.pair as string;
  const type = searchParams.get("type") || "spot";

  const { fetchSymbol } = useSymbol();

  useEffect(() => {
    if (pair) {
      fetchSymbol(pair, type);
    }
  }, [pair, type, fetchSymbol]);

  return (
    <div>
      <MarketTitleUpdater pair={pair} type={type} />
      <MenuBar />
      <div className="flex min-h-[900px] gap-1 mt-1 mx-1">
        <div className="flex-1 gap-1 flex flex-col">
          <MarketHeader pair={pair} type={type} />
          <div className="flex-1 flex gap-1">
            <OrderBook pair={pair} type={type} />
            <div className="flex flex-1 flex-col gap-1">
              <ChartPanel pair={pair} type={type} />
              <OrderEntryPanel pair={pair} type={type} />
            </div>
          </div>
        </div>
        <div className="w-[23%] h-[1005px] flex flex-col gap-1">
          <TradingPairListPanel pair={pair} type={type} />
          <RecentTrades pair={pair} />
        </div>
      </div>
      <UserOrderManagementPanel pair={pair} />
      <GlobalStatusBar pair={pair} type={type} />
    </div>
  );
}
