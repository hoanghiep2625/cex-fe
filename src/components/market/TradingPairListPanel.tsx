"use client";

import { useState } from "react";
import Link from "next/link";
import { LuChevronRight, LuSearch, LuStar } from "react-icons/lu";
import { TiArrowUnsorted } from "react-icons/ti";
import { useTicker } from "@/hooks/useTicker";
import ConnectionStatus from "@/components/ui/ConnectionStatus";
import { fmt } from "@/lib/formatters";

export default function TradingPairListPanel() {
  const [activeTab, setActiveTab] = useState("USDT");
  const [searchTerm, setSearchTerm] = useState("");

  const { tickers, connected } = useTicker({
    quoteAsset: activeTab,
    type: "spot",
  });

  const tradingPairs = tickers?.map((sym) => ({
    name: `${sym.base_asset}/${sym.quote_asset}`,
    leverage: "5x",
    price: sym.price || 0,
    change: sym.priceChangePercent24h || 0,
  }));

  const filteredPairs = tradingPairs?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = ["Mới", "USDC", "USDT", "FDUSD", "BNB"];

  return (
    <div className="relative h-[50%] dark:bg-[#181A20] bg-white rounded-[10px] dark:text-white text-black flex flex-col overflow-hidden">
      {/* Search Section */}
      <div className="pt-4 dark:border-b dark:border-[#181A20] border-b border-gray-200">
        <div className="relative mb-3 px-4 text-xs font-semibold">
          <LuSearch className="absolute left-7 top-2 w-5 h-5 dark:text-gray-500 text-gray-600 text-xs" />
          <input
            type="text"
            placeholder="Tìm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 dark:bg-[#181A20] bg-white dark:text-white text-black rounded-lg dark:border-gray-600 border-gray-300 border focus:outline-none focus:dark:border-yellow-500 focus:border-yellow-400 transition"
          />
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-6 overflow-x-auto scrollbar-hide dark:border-b dark:border-gray-700 border-b border-gray-200 items-center justify-center">
          <div className="mb-2 flex justify-center gap-6 items-center">
            {tabs.map((tab) => (
              <div key={tab} className="relative inline-flex ">
                <button
                  onClick={() => setActiveTab(tab)}
                  className={` text-xs font-semibold transition ${
                    activeTab === tab
                      ? "dark:text-white text-black"
                      : "dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-black"
                  }`}
                >
                  {tab}
                </button>
                {activeTab === tab && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
                )}
              </div>
            ))}
            <button className="dark:text-gray-400 text-gray-600 flex hover:dark:text-gray-300 hover:text-gray-800 transition">
              <LuChevronRight width={16} height={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Headers and Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header Row */}
        <div className="sticky top-0 px-4 dark:bg-[#181A20] bg-white py-3 flex justify-between text-xs font-semibold dark:text-gray-400 text-gray-600">
          <div>Cặp</div>
          <div className="flex gap-2">
            <div className="flex items-center justify-end gap-1">
              <span className="truncate block max-w-[50%]" title="Giá gần nhất">
                Giá gần nhất
              </span>
              <TiArrowUnsorted className="text-xs" />
            </div>

            <div className="flex items-center gap-1">
              <span
                className="truncate block max-w-[120px]"
                title="Biến động trong 24h"
              >
                / Biến động trong 24h
              </span>
              <TiArrowUnsorted className="text-xs" />
            </div>
          </div>
        </div>

        {/* Data Rows */}
        <div className="">
          {filteredPairs?.map((p, index) => (
            <Link
              href={`/trade/${p.name.replace("/", "_")}?type=spot`}
              key={index}
            >
              <div className="px-4 py-1 flex justify-between dark:hover:bg-[#1F2329] hover:bg-gray-100 transition text-xs items-center cursor-pointer">
                <div className="flex items-center gap-2">
                  <button className="dark:text-gray-500 text-gray-600 hover:text-yellow-500 transition">
                    <LuStar width={14} height={14} />
                  </button>
                  <div className="flex">
                    <div className="font-semibold dark:text-white text-black">
                      {p.name}
                    </div>
                    <div className="text-xs dark:text-white text-black dark:bg-gray-700 bg-gray-300 px-1 ml-1">
                      {p.leverage}
                    </div>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="font-medium dark:text-white text-black text-right">
                    {fmt(p.price)}
                  </div>
                  <div
                    className={`font-medium w-14 text-right ${
                      p.change >= 0 ? "text-green-400" : "text-red-400"
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
      <ConnectionStatus connected={connected} />
    </div>
  );
}
