"use client";

import { useState, useMemo } from "react";
import { useRecentTrades } from "@/hooks/useRecentTrades";
import TabUnderline from "./ui/TabUnderline";
import ConnectionStatus from "@/components/ui/ConnectionStatus";

interface Trade {
  price: string;
  quantity: string;
  time: number;
  takerSide: "BUY" | "SELL";
}

export default function RecentTrades({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [activeTab, setActiveTab] = useState<"market" | "user">("market");

  // Convert pair format: "BTC_USDT" → "BTCUSDT"
  const symbol = useMemo(() => pair.replace("_", ""), [pair]);
  const { trades, loading, error, connected } = useRecentTrades(symbol);

  // Format time from milliseconds to HH:MM:SS
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Format price and quantity for display
  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  const formatQuantity = (quantity: string | number) => {
    const num = typeof quantity === "string" ? parseFloat(quantity) : quantity;
    return num.toFixed(5);
  };

  return (
    <div className="h-[50%] dark:bg-[#181A20] bg-white rounded-[10px] dark:text-white text-black flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className=" relative px-4 pt-3 dark:border-b dark:border-gray-700 border-b border-gray-200 flex items-center gap-4">
        <TabUnderline
          className="text-xs font-semibold pb-3"
          active={activeTab === "market"}
          onClick={() => setActiveTab("market")}
        >
          Thị trường giao dịch
        </TabUnderline>
        <TabUnderline
          className="text-xs font-semibold pb-3"
          active={activeTab === "user"}
          onClick={() => setActiveTab("user")}
        >
          Giao dịch của tôi
        </TabUnderline>
        <button className="ml-auto dark:text-gray-400 text-gray-600 hover:dark:text-gray-200 hover:text-gray-800 text-lg">
          ⋯
        </button>
        {/* Connection Status */}
        <ConnectionStatus connected={connected} />
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Table Headers */}
        <div className="sticky top-0 dark:bg-[#181A20] bg-white px-4 py-3 flex justify-between gap-2 text-xs dark:text-gray-400 text-gray-600">
          <div>Giá (USDT)</div>
          <div>Số lượng</div>
          <div>Thời gian</div>
        </div>

        {/* Table Rows */}
        <div>
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="px-4 py-0.5 flex justify-between gap-2 text-xs dark:hover:bg-[#1F2329] hover:bg-gray-100 transition"
            >
              <div
                className={`font-semibold text-xs flex-1 ${
                  trade.takerSide === "BUY" ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatPrice(trade.price)}
              </div>
              <div className="dark:text-white text-black text-xs text-center flex-1">
                {formatQuantity(trade.quantity)}
              </div>
              <div className="dark:text-white text-black text-xs text-right flex-1">
                {formatTime(trade.time)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
