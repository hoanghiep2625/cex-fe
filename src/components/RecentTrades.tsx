"use client";

import { useState } from "react";

interface Trade {
  price: number;
  quantity: number;
  time: string;
  type: "buy" | "sell";
}

const recentTrades: Trade[] = [
  { price: 108.35923, quantity: 0.09234, time: "09:37:16", type: "sell" },
  { price: 108.35921, quantity: 0.0007, time: "09:37:16", type: "buy" },
  { price: 108.35932, quantity: 0.00032, time: "09:37:16", type: "buy" },
  { price: 108.35912, quantity: 0.09234, time: "09:37:15", type: "sell" },
  { price: 108.35932, quantity: 0.09234, time: "09:37:15", type: "sell" },
  { price: 108.35912, quantity: 0.09234, time: "09:37:14", type: "sell" },
  { price: 108.35932, quantity: 0.09234, time: "09:37:14", type: "sell" },
  { price: 108.35912, quantity: 0.00828, time: "09:37:13", type: "sell" },
  { price: 108.35932, quantity: 0.00828, time: "09:37:13", type: "sell" },
  { price: 108.35932, quantity: 0.09234, time: "09:37:13", type: "sell" },
  { price: 108.35921, quantity: 0.09234, time: "09:37:13", type: "sell" },
  { price: 108.35932, quantity: 0.00108, time: "09:37:13", type: "sell" },
  { price: 108.35912, quantity: 0.00108, time: "09:37:13", type: "sell" },
  { price: 108.35921, quantity: 0.09234, time: "09:37:13", type: "sell" },
  { price: 108.35932, quantity: 0.00108, time: "09:37:13", type: "sell" },
  { price: 108.35912, quantity: 0.00108, time: "09:37:13", type: "sell" },
  { price: 108.35921, quantity: 0.09234, time: "09:37:13", type: "sell" },
  { price: 108.35932, quantity: 0.00108, time: "09:37:13", type: "sell" },
  { price: 108.35912, quantity: 0.00108, time: "09:37:13", type: "sell" },
];

export default function RecentTrades({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [activeTab, setActiveTab] = useState<"market" | "user">("market");

  return (
    <div className="h-[50%] bg-[#181A20] rounded-[10px] text-white flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="px-4 pt-3 border-b border-gray-700 flex items-center gap-4">
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
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Table Headers */}
        <div className="sticky top-0 bg-[#181A20] px-4 py-3 flex justify-between gap-2 text-xs text-gray-400">
          <div>Giá (USDT)</div>
          <div>Số lượng (BTC)</div>
          <div>Thời gian</div>
        </div>

        {/* Table Rows */}
        <div className="">
          {recentTrades.map((trade, index) => (
            <div
              key={index}
              className="px-4 py-0.5 flex justify-between gap-2 text-xs hover:bg-[#1F2329] transition"
            >
              <div
                className={`font-semibold text-xs ${
                  trade.type === "buy" ? "text-green-400" : "text-red-400"
                }`}
              >
                {trade.price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-white text-xs">
                {trade.quantity.toFixed(5)}
              </div>
              <div className="text-white text-xs">{trade.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
