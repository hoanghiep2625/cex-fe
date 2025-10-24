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
    <div className="h-[50%] bg-[#181A20] rounded-[10px] text-white flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className=" relative px-4 pt-3 border-b border-gray-700 flex items-center gap-4">
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
        <button className="ml-auto text-gray-400 hover:text-gray-300 text-lg">
          ⋯
        </button>
        {/* Connection Status */}
        <ConnectionStatus connected={connected} />
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
