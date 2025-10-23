"use client";

import { useState, useMemo } from "react";
import { useRecentTrades } from "@/hooks/useRecentTrades";

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
    <div className="h-[50%] bg-[#181A20] rounded-[10px] text-white flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className=" relative px-4 pt-3 border-b border-gray-700 flex items-center gap-4">
        <div className="relative inline-flex">
          <button
            onClick={() => setActiveTab("market")}
            className={`pb-2 text-[12px] font-semibold ${
              activeTab === "market" ? "text-white" : "text-gray-400"
            }`}
          >
            Thị trường giao dịch
          </button>
          {activeTab === "market" && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
          )}
        </div>
        <div className="relative inline-flex">
          <button
            onClick={() => setActiveTab("user")}
            className={`pb-2 text-[12px] font-semibold ${
              activeTab === "user" ? "text-white" : "text-gray-400"
            }`}
          >
            Giao dịch của tôi
          </button>
          {activeTab === "user" && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
          )}
        </div>
        <button className="ml-auto text-gray-400 hover:text-gray-300 text-lg">
          ⋯
        </button>
        {/* Connection Status */}
        <div className="text-xs ml-2 absolute right-1 top-0">
          {connected ? (
            <span className="text-green-400">●</span>
          ) : (
            <span className="text-red-400">●</span>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Table Headers */}
        <div className="sticky top-0 bg-[#181A20] px-4 py-3 flex justify-between gap-2 text-xs text-gray-400">
          <div>Giá (USDT)</div>
          <div>Số lượng</div>
          <div>Thời gian</div>
        </div>

        {/* Table Rows */}
        <div>
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="px-4 py-0.5 flex justify-between gap-2 text-xs hover:bg-[#1F2329] transition"
            >
              <div
                className={`font-semibold text-xs flex-1 ${
                  trade.takerSide === "BUY" ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatPrice(trade.price)}
              </div>
              <div className="text-white text-xs text-center flex-1">
                {formatQuantity(trade.quantity)}
              </div>
              <div className="text-white text-xs text-right flex-1">
                {formatTime(trade.time)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
