"use client";

import { useState, useMemo } from "react";
import TabUnderline from "@/components/ui/TabUnderline";
import { fmt, formatTime } from "@/lib/formatters";
import { useRecentTrades } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

interface Trade {
  id: string;
  price: string;
  quantity: string;
  time: number;
  takerSide: "BUY" | "SELL";
}

export default function RecentTrades({ pair }: { pair: string }) {
  const [activeTab, setActiveTab] = useState<"market" | "user">("market");

  const symbol = useMemo(() => pair.replace("_", ""), [pair]);

  // Fetch initial recent trades data from REST API
  const { data: initialTrades } = useQuery<Trade[]>({
    queryKey: ["recentTrades", symbol],
    queryFn: () =>
      axiosInstance
        .get(`/trades/recent/${symbol}`, { params: { limit: 50 } })
        .then((r) => r.data?.data || []),
    refetchOnWindowFocus: false,
  });

  // Subscribe to WebSocket updates
  const { trades: wsTrades } = useRecentTrades(symbol);

  // Use WebSocket update if available, otherwise use initial data from REST API
  const trades = useMemo(() => {
    const ws = wsTrades as Trade[] | null;
    if (Array.isArray(ws) && ws.length > 0) return ws;
    if (Array.isArray(initialTrades)) return initialTrades;
    return [];
  }, [wsTrades, initialTrades]);

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
              className="px-4 py-0.5 flex justify-between gap-2 text-xs transition cursor-pointer"
            >
              <div
                className={`font-medium text-xs flex-1 ${
                  trade.takerSide === "BUY" ? "text-green-400" : "text-red-400"
                }`}
              >
                {fmt(Number(trade.price) || 0)}
              </div>
              <div className="dark:text-white text-black text-xs font-medium text-center flex-1">
                {formatQuantity(trade.quantity)}
              </div>
              <div className="dark:text-white text-black text-xs font-medium text-right flex-1">
                {formatTime(trade.time)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
