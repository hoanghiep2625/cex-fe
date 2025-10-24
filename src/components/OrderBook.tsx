"use client";

import { useState } from "react";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useSymbol } from "@/context/SymbolContext";
import ConnectionStatus from "@/components/ui/ConnectionStatus";

const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function OrderBook({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [grouping, setGrouping] = useState("0.01");
  const { symbol } = useSymbol();
  const { orderBook, connected, error } = useOrderBook(
    symbol?.code || pair.replace("_", ""),
    type || "spot"
  );

  const { asks = [], bids = [], currentPrice = 0 } = orderBook || {};
  const totalBids = bids.reduce((s, b) => s + b.quantity, 0);
  const totalAsks = asks.reduce((s, a) => s + a.quantity, 0);
  const buyPct = (totalBids / (totalBids + totalAsks)) * 100 || 0;

  interface Level {
    price: number;
    quantity: number;
    total: number;
  }

  const Row = ({ level, isAsk }: { level: Level; isAsk?: boolean }) => (
    <div
      className={`px-4 py-1 grid grid-cols-3 gap-4 relative text-xs hover:bg-gray-800/50`}
    >
      <div
        className={`absolute inset-0 ${
          isAsk ? "bg-red-900/5" : "bg-green-900/5"
        } right-0`}
        style={{ width: isAsk ? "30%" : "40%" }}
      />
      <span
        className={`relative z-10 ${isAsk ? "text-red-400" : "text-green-400"}`}
      >
        {fmt(level.price)}
      </span>
      <span className="text-white text-right relative z-10 font-semibold">
        {level.quantity.toFixed(5)}
      </span>
      <span className="text-white text-right relative z-10 font-semibold">
        {level.total.toFixed(2)}
      </span>
    </div>
  );

  return (
    <div className="flex-1 bg-[#181A20] rounded-[10px] text-white flex flex-col relative">
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between">
        <span className="text-sm font-semibold">Sổ lệnh</span>
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
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-[10px] text-gray-500 font-semibold grid grid-cols-3 gap-4">
        <span>Giá (USDT)</span>
        <span className="text-right">Số lượng (BTC)</span>
        <span className="text-right">Tổng</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div>
          {asks.map((a, i) => (
            <Row key={`a${i}`} level={a} isAsk />
          ))}
        </div>

        <div className="px-4 py-2 flex items-center gap-2">
          <span className="text-lg font-bold text-yellow-400">
            {fmt(currentPrice)}
          </span>
        </div>

        <div>
          {bids.map((b, i) => (
            <Row key={`b${i}`} level={b} />
          ))}
        </div>
      </div>

      <div className="px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span>
            B <span className="text-green-400">{buyPct.toFixed(1)}%</span>
          </span>
          <div className="flex-1 flex h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="bg-green-400" style={{ width: `${buyPct}%` }} />
            <div className="bg-red-400" style={{ width: `${100 - buyPct}%` }} />
          </div>
          <span>
            <span className="text-red-400">{(100 - buyPct).toFixed(1)}%</span> S
          </span>
        </div>
      </div>
      <ConnectionStatus connected={connected} />
    </div>
  );
}
