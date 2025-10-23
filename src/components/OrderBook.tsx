"use client";

import { useState } from "react";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useSymbol } from "@/context/SymbolContext";

// Format number with fixed locale
const formatPrice = (num: number) => {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function OrderBook({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [grouping, setGrouping] = useState("0.01");
  const [viewType, setViewType] = useState(0);
  const { symbol } = useSymbol();
  const { orderBook, loading, connected, error } = useOrderBook(
    symbol?.code || "BTCUSDT"
  );

  // Use real data or mock data as fallback
  const displayData = orderBook || {
    asks: [],
    bids: [],
    currentPrice: 0,
  };

  const totalBids = displayData.bids.reduce(
    (sum: number, bid: any) => sum + bid.quantity,
    0
  );
  const totalAsks = displayData.asks.reduce(
    (sum: number, ask: any) => sum + ask.quantity,
    0
  );
  const buyPercent = (totalBids / (totalBids + totalAsks)) * 100;

  return (
    <div className="flex-1 bg-[#181A20] rounded-[10px] text-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-semibold">Số lệnh</span>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={() => setViewType(0)}
              className={`p-1 text-xs ${
                viewType === 0 ? "text-yellow-400" : "text-gray-400"
              }`}
            >
              ⊞⊞
            </button>
            <button
              onClick={() => setViewType(1)}
              className={`p-1 text-xs ${
                viewType === 1 ? "text-yellow-400" : "text-gray-400"
              }`}
            >
              ≡⊞
            </button>
            <button
              onClick={() => setViewType(2)}
              className={`p-1 text-xs ${
                viewType === 2 ? "text-yellow-400" : "text-gray-400"
              }`}
            >
              ≡≡
            </button>
          </div>

          <select
            value={grouping}
            onChange={(e) => setGrouping(e.target.value)}
            className="bg-transparent text-xs text-white cursor-pointer"
          >
            <option value="0.01">0.01</option>
            <option value="0.1">0.1</option>
            <option value="1">1</option>
            <option value="10">10</option>
          </select>

          <button className="text-gray-400 hover:text-white">···</button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-4 py-2 border-b border-gray-700 text-[10px] text-gray-500 font-semibold grid grid-cols-3 gap-4">
        <span>Giá (USDT)</span>
        <span className="text-right">Số lượng (BTC)</span>
        <span className="text-right">Tổng</span>
      </div>

      {/* Order Book */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Connection Status */}
        {!connected && (
          <div className="px-4 py-2 bg-red-900/20 text-red-400 text-xs text-center">
            {error || "Đang kết nối..."}
          </div>
        )}

        {/* Asks */}
        <div>
          {displayData.asks.map((ask: any, idx: number) => (
            <div
              key={`ask-${idx}`}
              className="px-4 py-1 text-xs hover:bg-gray-800/50 grid grid-cols-3 gap-4 relative"
            >
              <div
                className="absolute inset-0 bg-red-900/5 right-0"
                style={{ width: "30%" }}
              />
              <span className="text-red-400 relative text-[12px] z-10">
                {formatPrice(ask.price)}
              </span>
              <span className="text-white text-right text-[12px] relative z-10 font-semibold">
                {ask.quantity.toFixed(5)}
              </span>
              <span className="text-white text-right text-[12px] relative z-10 font-semibold">
                {ask.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="px-4 py-2 bg-[#181A20] gap-4 sticky flex items-center">
          <span className="text-lg font-bold text-red-400">
            {formatPrice(displayData.currentPrice || 0)}
          </span>
          <span className="text-right text-[12px] text-gray-400">
            ${formatPrice(displayData.currentPrice || 0)}
          </span>
        </div>

        {/* Bids */}
        <div>
          {displayData.bids.map((bid: any, idx: number) => (
            <div
              key={`bid-${idx}`}
              className="px-4 py-1 text-xs hover:bg-gray-800/50 grid grid-cols-3 gap-4 relative"
            >
              <div
                className="absolute inset-0 bg-green-900/5 right-0"
                style={{ width: "40%" }}
              />
              <span className="text-green-400 relative z-10">
                {formatPrice(bid.price)}
              </span>
              <span className="text-white text-right text-[12px] relative z-10 font-semibold">
                {bid.quantity.toFixed(5)}
              </span>
              <span className="text-white text-right text-[12px] relative z-10 font-semibold">
                {bid.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ratio */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white">
            B <span className="text-green-400">{buyPercent.toFixed(1)}%</span>
          </span>
          <div className="flex-1 flex h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="bg-green-400" style={{ width: `${buyPercent}%` }} />
            <div
              className="bg-red-400"
              style={{ width: `${100 - buyPercent}%` }}
            />
          </div>
          <span className="text-white">
            <span className="text-red-400">
              {(100 - buyPercent).toFixed(1)}%
            </span>{" "}
            S
          </span>
        </div>
      </div>
    </div>
  );
}
