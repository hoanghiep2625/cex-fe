"use client";

import { useState } from "react";

// Mock Order Book Data
const mockOrderBook = {
  asks: [
    { price: 107779.32, quantity: 0.00005, total: 5.38896 },
    { price: 107778.4, quantity: 0.20781, total: 22.39 },
    { price: 107778.39, quantity: 0.10283, total: 11.08 },
    { price: 107778.24, quantity: 0.00005, total: 5.38891 },
    { price: 107777.9, quantity: 0.05206, total: 5.61 },
    { price: 107777.89, quantity: 0.00117, total: 126.10013 },
    { price: 107777.44, quantity: 0.00005, total: 5.38887 },
    { price: 107777.42, quantity: 0.00005, total: 5.38887 },
    { price: 107777.41, quantity: 0.01281, total: 1.38 },
    { price: 107777.33, quantity: 0.00005, total: 5.38886 },
    { price: 107777.32, quantity: 0.01878, total: 2.02 },
    { price: 107777.01, quantity: 0.00005, total: 5.38885 },
    { price: 107777.0, quantity: 0.0179, total: 1.92 },
    { price: 107776.9, quantity: 0.0001, total: 10.77769 },
  ],
  currentPrice: 107776.81,
  bids: [
    { price: 107776.81, quantity: 2.60257, total: 280.49 },
    { price: 107776.8, quantity: 0.00139, total: 149.80975 },
    { price: 107776.79, quantity: 0.00005, total: 5.38883 },
    { price: 107776.73, quantity: 0.00284, total: 307.16368 },
    { price: 107776.72, quantity: 0.00005, total: 5.38883 },
    { price: 107776.51, quantity: 0.0001, total: 10.77765 },
    { price: 107776.5, quantity: 0.2275, total: 24.51 },
    { price: 107776.49, quantity: 0.00005, total: 5.38882 },
    { price: 107776.0, quantity: 0.00005, total: 5.38879 },
    { price: 107775.74, quantity: 0.00107, total: 115.32004 },
    { price: 107775.73, quantity: 0.00004, total: 5.38878 },
    { price: 107775.39, quantity: 0.0001, total: 10.77753 },
    { price: 107775.38, quantity: 0.62015, total: 66.83 },
    { price: 107775.0, quantity: 0.00005, total: 5.38875 },
  ],
};

// Format number with fixed locale
const formatPrice = (num: number) => {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function OrderBook() {
  const [grouping, setGrouping] = useState("0.01");
  const [viewType, setViewType] = useState(0);

  const totalBids = mockOrderBook.bids.reduce(
    (sum, bid) => sum + bid.quantity,
    0
  );
  const totalAsks = mockOrderBook.asks.reduce(
    (sum, ask) => sum + ask.quantity,
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
        {/* Asks */}
        <div>
          {mockOrderBook.asks.map((ask, idx) => (
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
            {formatPrice(mockOrderBook.currentPrice)}
          </span>
          <span className="text-right text-[12px] text-gray-400">
            ${formatPrice(mockOrderBook.currentPrice)}
          </span>
        </div>

        {/* Bids */}
        <div>
          {mockOrderBook.bids.map((bid, idx) => (
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
