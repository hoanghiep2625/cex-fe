"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useMarketData } from "@/hooks/useMarketData";
import ConnectionStatus from "@/components/ui/ConnectionStatus";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { fmt } from "@/components/OrderBook";
import { useRecentTrades } from "@/hooks/useRecentTrades";

export interface SymbolInfo {
  id: number;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  name?: string;
}

export default function MarketHeader({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const symbol = useMemo(() => pair.replace("_", ""), [pair]);
  const { marketData, connected } = useMarketData(symbol, type);
  const { trades } = useRecentTrades(symbol);
  const { data } = useQuery<SymbolInfo>({
    queryKey: ["symbolInfo"],
    queryFn: () =>
      axiosInstance
        .get(`/symbols/code/${symbol}`)
        .then((r) => r.data?.data ?? r.data ?? []),
  });

  const baseAssetCode = useMemo(() => {
    if (data?.base_asset) {
      return data.base_asset.toUpperCase();
    }
    return symbol.replace("USDT", "").toUpperCase();
  }, [data, symbol]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="px-5 py-3 dark:bg-[#181A20] bg-white flex items-center gap-8 rounded-[10px] relative h-[70px]">
      {/* Left Section - BTC Info */}
      <div className="flex items-center gap-6">
        {/* Icon and Name */}
        {marketData && (
          <div className="flex items-center gap-2">
            <Image
              src={`/crypto-icons/${baseAssetCode}.webp`}
              alt={symbol}
              width={24}
              height={24}
              onError={(e) => {
                // Fallback to a default icon if image not found
                (e.target as HTMLImageElement).src =
                  "/crypto-icons/default.webp";
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="dark:text-white text-black text-xl font-semibold">
                  {marketData?.symbol || symbol}
                </span>
              </div>
              <span className="text-gray-400 text-xs">
                Giá {marketData?.name || "Market Price"}
              </span>
            </div>
          </div>
        )}

        {/* Price Display */}
        {marketData && (
          <div className="flex flex-col">
            <span
              className={`text-xl font-bold ${
                trades[0]?.takerSide === "BUY"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {fmt(marketData?.price || 0)}
            </span>
            <span className="dark:text-white text-black text-[12px] font-semibold">
              ${fmt(marketData?.price || 0)}
            </span>
          </div>
        )}
        {/* 24h Change */}
      </div>
      <div className="flex items-center gap-2 flex-1">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="shrink-0 flex items-center justify-center w-4 h-8 text-gray-400 hover:text-white rounded transition"
          >
            <LuChevronLeft />
          </button>
        )}
        {marketData && (
          <div className="relative flex-1">
            {/* Left Fade Gradient */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-linear-to-r dark:from-[#181A20] from-white to-transparent pointer-events-none z-10" />
            )}
            {/* Right Fade Gradient */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l dark:from-[#181A20] from-white to-transparent pointer-events-none z-10" />
            )}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-hidden flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="text-white shrink-0">
                <div>
                  <p className="text-[12px] text-gray-400">
                    Biến động trong 24 giờ
                  </p>
                </div>
                <span
                  className={`font-semibold text-[12px] ${
                    (marketData?.priceChangePercent24h || 0) < 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {`${(marketData?.priceChange24h || 0)?.toFixed(2)} ${(
                    marketData?.priceChangePercent24h || 0
                  )?.toFixed(2)}%`}
                </span>
              </div>
              <div className="dark:text-white text-black shrink-0">
                <div>
                  <p className="text-[12px] text-gray-400">Giá cao nhất 24h</p>
                </div>
                <span className="text-[12px] font-semibold">
                  {(marketData?.highPrice24h || 0)?.toLocaleString("vi-VN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="dark:text-white text-black shrink-0">
                <div>
                  <p className="text-[12px] text-gray-400">Giá thấp nhất 24h</p>
                </div>
                <span className="text-[12px] font-semibold">
                  {(marketData?.lowPrice24h || 0)?.toLocaleString("vi-VN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="dark:text-white text-black shrink-0">
                <div>
                  <p className="text-[12px] text-gray-400">
                    KL 24h({marketData?.symbol?.slice(0, -4) || "BTC"})
                  </p>
                </div>
                <span className="text-[12px] font-semibold">
                  {(marketData?.volume24h || 0)?.toLocaleString("vi-VN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="dark:text-white text-black shrink-0">
                <div>
                  <p className="text-[12px] text-gray-400">KL 24h(USDT)</p>
                </div>
                <span className=" text-[12px] font-semibold">
                  {(marketData?.quoteAssetVolume24h || 0)?.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }
                  )}
                </span>
              </div>
              <div className="dark:text-white text-black shrink-0">
                <div>
                  <p className="text-[12px] text-gray-400">Thẻ token</p>
                </div>
                <ul className="flex text-[12px] gap-2 text-yellow-400">
                  <li>POW</li>
                  <li>Payments</li>
                  <li>Khối lượng</li>
                  <li>Phổ biến</li>
                  <li>Price Protection</li>
                </ul>
              </div>
            </div>
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute -right-3 top-2 flex items-center justify-center w-4 h-8 text-gray-400 hover:text-white rounded transition"
              >
                <LuChevronRight className=" text-gray-400" />
              </button>
            )}
          </div>
        )}
      </div>
      <ConnectionStatus connected={connected} />
    </div>
  );
}
