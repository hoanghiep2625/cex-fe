"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface MarketData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  volume24h: number;
  quoteAssetVolume24h: number;
  icon?: string;
  description?: string;
}

export default function MarketHeader({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Mock data for different symbols
  const mockDataMap: Record<string, MarketData> = {
    BTCUSDT: {
      symbol: "BTCUSDT",
      price: 108650.03,
      priceChange24h: -1483.81,
      priceChangePercent24h: -1.35,
      highPrice24h: 111732.01,
      lowPrice24h: 107732.01,
      volume24h: 18866.88,
      quoteAssetVolume24h: 2084702661.81,
      icon: "https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/87496d50-2408-43e1-ad4c-78b47b448a6a.png",
      description: "Giá Bitcoin",
    },
    ETHUSDT: {
      symbol: "ETHUSDT",
      price: 3456.78,
      priceChange24h: 120.5,
      priceChangePercent24h: 3.61,
      highPrice24h: 3500.0,
      lowPrice24h: 3300.0,
      volume24h: 1234567.89,
      quoteAssetVolume24h: 4234567890.12,
      icon: "https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/0e0ce9de-6ce0-490d-a04a-f461db76dc0a.png",
      description: "Giá Ethereum",
    },
    BNBUSDT: {
      symbol: "BNBUSDT",
      price: 612.34,
      priceChange24h: 15.67,
      priceChangePercent24h: 2.62,
      highPrice24h: 650.0,
      lowPrice24h: 590.0,
      volume24h: 5678901.23,
      quoteAssetVolume24h: 3456789012.34,
      icon: "https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/52bab901-405e-4cdc-a773-c0e8beae0b8c.png",
      description: "Giá Binance Coin",
    },
    SOLUSDT: {
      symbol: "SOLUSDT",
      price: 189.45,
      priceChange24h: -8.32,
      priceChangePercent24h: -4.2,
      highPrice24h: 200.0,
      lowPrice24h: 185.0,
      volume24h: 3456789.01,
      quoteAssetVolume24h: 654321098.76,
      icon: "https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/f0582859-e20d-49a3-b722-1e64fbb76f84.png",
      description: "Giá Solana",
    },
  };

  // Fetch market data based on symbol from URL
  useEffect(() => {
    const symbol = searchParams.get("symbol") || pair || "BTCUSDT";
    setLoading(true);

    // Simulate API delay
    const timer = setTimeout(() => {
      const data = mockDataMap[symbol] || mockDataMap["BTCUSDT"];
      setMarketData(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams, pair]);

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
    <div className="px-5 py-3 bg-[#181A20] flex items-center gap-8 rounded-[10px]">
      {/* Left Section - BTC Info */}
      <div className="flex items-center gap-6">
        {/* Icon and Name */}
        <div className="flex items-center gap-2">
          <Image
            src={
              marketData?.icon ||
              "https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/87496d50-2408-43e1-ad4c-78b47b448a6a.png"
            }
            alt={marketData?.symbol || "Crypto"}
            width={24}
            height={24}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white text-xl font-semibold">
                {loading ? "Loading..." : marketData?.symbol || pair}
              </span>
            </div>
            <span className="text-gray-400 text-xs">
              {marketData?.description || "Market Price"}
            </span>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex flex-col">
          <span className="text-green-400 text-xl font-bold">
            {loading
              ? "--"
              : marketData?.price?.toLocaleString("vi-VN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
          </span>
          <span className="text-white text-[12px] font-semibold">
            $
            {loading
              ? "--"
              : marketData?.price?.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
          </span>
        </div>
        {/* 24h Change */}
      </div>
      <div className="flex items-center gap-2 flex-1">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="shrink-0 flex items-center justify-center w-4 h-8 text-gray-400 hover:text-white rounded transition"
          >
            &lt;
          </button>
        )}
        <div className="relative flex-1">
          {/* Left Fade Gradient */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-linear-to-r from-[#181A20] to-transparent pointer-events-none z-10" />
          )}

          {/* Right Fade Gradient */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-[#181A20] to-transparent pointer-events-none z-10" />
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
                {loading
                  ? "--"
                  : `${marketData?.priceChange24h?.toFixed(
                      2
                    )} ${marketData?.priceChangePercent24h?.toFixed(2)}%`}
              </span>
            </div>
            <div className="text-white shrink-0">
              <div>
                <p className="text-[12px] text-gray-400">Giá cao nhất 24h</p>
              </div>
              <span className="text-[12px] font-semibold">
                {loading
                  ? "--"
                  : marketData?.highPrice24h?.toLocaleString("vi-VN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </span>
            </div>
            <div className="text-white shrink-0">
              <div>
                <p className="text-[12px] text-gray-400">Giá thấp nhất 24h</p>
              </div>
              <span className="text-[12px] font-semibold">
                {loading
                  ? "--"
                  : marketData?.lowPrice24h?.toLocaleString("vi-VN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </span>
            </div>
            <div className="text-white shrink-0">
              <div>
                <p className="text-[12px] text-gray-400">
                  KL 24h({marketData?.symbol?.slice(0, -4) || "BTC"})
                </p>
              </div>
              <span className="text-[12px] font-semibold">
                {loading
                  ? "--"
                  : marketData?.volume24h?.toLocaleString("vi-VN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </span>
            </div>
            <div className="text-white shrink-0">
              <div>
                <p className="text-[12px] text-gray-400">KL 24h(USDT)</p>
              </div>
              <span className=" text-[12px] font-semibold">
                {loading
                  ? "--"
                  : marketData?.quoteAssetVolume24h?.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
              </span>
            </div>
            <div className="text-white shrink-0">
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
        </div>
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="shrink-0 flex items-center justify-center w-4 h-8 text-gray-400 hover:text-white rounded transition"
          >
            &gt;
          </button>
        )}
      </div>
    </div>
  );
}
