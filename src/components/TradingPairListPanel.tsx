"use client";

import { useState } from "react";
import { ChevronRight, Search, Star } from "lucide-react";
import { useSymbols } from "@/hooks/useSymbols";
import Link from "next/link";

interface TradingPair {
  name: string;
  leverage: string;
  price: number;
  change: number;
}

export default function TradingPairListPanel({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [activeTab, setActiveTab] = useState("USDT");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch symbols based on active tab (quote asset)
  const { symbols, loading, error } = useSymbols(activeTab);

  // Convert symbols to display format
  const tradingPairs = symbols.map((sym) => ({
    name: `${sym.base_asset}/${sym.quote_asset}`,
    leverage: "5x",
    price: Math.random() * 100, // Placeholder - would need market data
    change: (Math.random() - 0.5) * 10, // Placeholder
  }));

  const filteredPairs = tradingPairs.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex px-4 gap-6 overflow-x-auto scrollbar-hide border-b border-gray-700 items-center justify-center">
          <div className="mb-2 flex justify-center gap-6 items-center">
            {tabs.map((tab) => (
              <div key={tab} className="relative inline-flex ">
                <button
                  onClick={() => setActiveTab(tab)}
                  className={` text-xs font-semibold transition ${
                    activeTab === tab
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
                {activeTab === tab && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
                )}
              </div>
            ))}
            <button className="text-gray-400 flex hover:text-gray-300 transition">
              <ChevronRight width={16} height={16} />
            </button>
          </div>
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
          {filteredPairs.map((p, index) => (
            <Link
              href={`/trade/${p.name.replace("/", "_")}?type=spot`}
              key={index}
            >
              <div className="px-4 py-1 flex justify-between hover:bg-[#1F2329] transition text-xs items-center cursor-pointer">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(p.name);
                    }}
                    className="text-gray-500 hover:text-yellow-500 transition"
                  >
                    <Star
                      width={14}
                      height={14}
                      fill={favorites.has(p.name) ? "currentColor" : "none"}
                    />
                  </button>
                  <div className="flex">
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-xs text-white bg-gray-700 px-1 ml-1">
                      {p.leverage}
                    </div>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="font-semibold text-white text-right">
                    {p.price.toLocaleString("en-US", {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })}
                  </div>
                  <div
                    className={`font-semibold w-14 text-right ${
                      p.change > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {p.change > 0 ? "+" : ""}
                    {p.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
