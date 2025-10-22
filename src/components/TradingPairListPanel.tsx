"use client";

import { useState } from "react";
import { Search, Star } from "lucide-react";

interface TradingPair {
  name: string;
  leverage: string;
  price: number;
  change: number;
}

const tradingPairs: TradingPair[] = [
  { name: "AEUR/USDT", leverage: "5x", price: 1.0627, change: 2.12 },
  { name: "AEVO/USDT", leverage: "5x", price: 0.0636, change: -3.05 },
  { name: "AGLD/USDT", leverage: "5x", price: 0.409, change: -0.24 },
  { name: "AI/USDT", leverage: "5x", price: 0.0744, change: -3.63 },
  { name: "AIXBT/USDT", leverage: "5x", price: 0.0563, change: -5.06 },
  { name: "ALCX/USDT", leverage: "5x", price: 8.18, change: -2.85 },
  { name: "ALGO/USDT", leverage: "5x", price: 0.181, change: -1.15 },
  { name: "ALICE/USDT", leverage: "5x", price: 0.3223, change: -7.54 },
  { name: "ALPINE/USDT", leverage: "5x", price: 0.826, change: -4.95 },
  { name: "ALT/USDT", leverage: "5x", price: 0.01891, change: -2.93 },
  { name: "AMP/USDT", leverage: "5x", price: 0.002399, change: -3.15 },
  { name: "ANIME/USDT", leverage: "5x", price: 0.00939, change: 2.69 },
  { name: "ANKR/USDT", leverage: "5x", price: 0.01031, change: -0.87 },
];

export default function TradingPairListPanel() {
  const [activeTab, setActiveTab] = useState("USDT");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredPairs = tradingPairs.filter((pair) =>
    pair.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (name: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(name)) {
      newFavorites.delete(name);
    } else {
      newFavorites.add(name);
    }
    setFavorites(newFavorites);
  };

  const tabs = ["Mới", "USDC", "USDT", "FDUSD", "BNB"];

  return (
    <div className="h-[50%] bg-[#181A20] rounded-[10px] text-white flex flex-col overflow-hidden">
      {/* Search Section */}
      <div className="pt-4 border-b border-[#181A20]">
        <div className="relative mb-3 px-4 text-xs font-semibold">
          <Search className="absolute left-7 top-2 w-5 h-5 text-gray-500 text-xs" />
          <input
            type="text"
            placeholder="Tìm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#181A20] text-white rounded-lg border border-gray-600 focus:outline-none focus:border-yellow-500 transition"
          />
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-6 overflow-x-auto scrollbar-hide border-b border-gray-700">
          {tabs.map((tab) => (
            <div key={tab} className="relative inline-flex">
              <button
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-xs font-semibold transition ${
                  activeTab === tab
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[16px] h-[3px] bg-yellow-400" />
              )}
            </div>
          ))}
          <button className="text-gray-400 hover:text-gray-300 transition">
            &gt;
          </button>
        </div>
      </div>

      {/* Table Headers and Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header Row */}
        <div className="sticky top-0 px-4 bg-[#181A20] py-3 flex justify-between text-xs font-semibold text-gray-400">
          <div>Cặp</div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              Giá g...
              <span className="text-xs">↕</span>
            </div>
            <div className="flex items-center gap-1">
              / Biến động tro...
              <span className="text-xs">↕</span>
            </div>
          </div>
        </div>

        {/* Data Rows */}
        <div className="">
          {filteredPairs.map((pair, index) => (
            <div
              key={index}
              className="px-4 py-1 flex justify-between hover:bg-[#1F2329] transition text-xs items-center"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(pair.name)}
                  className="text-gray-500 hover:text-yellow-500 transition"
                >
                  <Star
                    width={14}
                    height={14}
                    fill={favorites.has(pair.name) ? "currentColor" : "none"}
                  />
                </button>
                <div className="flex">
                  <div className="font-semibold text-white">{pair.name}</div>
                  <div className="text-xs text-white bg-gray-700 px-1 ml-1">
                    {pair.leverage}
                  </div>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="font-semibold text-white text-right">
                  {pair.price.toLocaleString("en-US", {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}
                </div>
                <div
                  className={`font-semibold w-14 text-right ${
                    pair.change > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {pair.change > 0 ? "+" : ""}
                  {pair.change.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
