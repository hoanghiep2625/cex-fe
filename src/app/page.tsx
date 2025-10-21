"use client";

import MenuBar from "@/components/MenuBar";
import OrderBook from "@/components/OrderBook";
import MarketHeader from "@/components/MarketHeader";
import TradingPairListPanel from "@/components/TradingPairListPanel";
import RecentTrades from "@/components/RecentTrades";
import OrderEntryPanel from "@/components/OrderEntryPanel";
import ChartPanel from "@/components/ChartPanel";
import GlobalStatusBar from "@/components/GlobalStatusBar";
import UserOrderManagementPanel from "@/components/UserOrderManagementPanel";

export default function Home() {
  return (
    <div className="bg-[#0B0E11]">
      <MenuBar />
      <div className="flex min-h-[900px] gap-[4px] mt-[4px] mx-[4px]">
        {/* <div className="bg-red-500 w-full h-15"></div> */}
        <div className="flex-3 gap-[4px] flex flex-col">
          <MarketHeader />
          <div className="flex-1 flex gap-[4px]">
            <OrderBook />
            <div className="flex-[2.5] flex flex-col gap-[4px]">
              <ChartPanel />
              <OrderEntryPanel />
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-[4px]">
          <TradingPairListPanel />
          <RecentTrades />
        </div>
      </div>
      <UserOrderManagementPanel />
      <GlobalStatusBar />
    </div>
  );
}
