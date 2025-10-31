"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useMarketData } from "@/hooks/useMarketData";
import { CiStar } from "react-icons/ci";
import ConnectionStatus from "@/components/ui/ConnectionStatus";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { MdOutlineArrowOutward } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { fmt } from "@/components/OrderBook";
import Link from "next/link";

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
  const [imageError, setImageError] = useState(false);

  const symbol = useMemo(() => pair.replace("_", ""), [pair]);
  const {
    marketData,
    connected,
    loading: marketDataLoading,
  } = useMarketData(symbol, type);
  const { data, isLoading: symbolInfoLoading } = useQuery<SymbolInfo>({
    queryKey: ["symbolInfo", symbol],
    queryFn: () =>
      axiosInstance.get(`/symbols/code/${symbol}`).then((r) => r.data?.data),
  });

  const isLoading = marketDataLoading || symbolInfoLoading || !marketData;

  const baseAssetCode = useMemo(() => {
    if (data?.base_asset) {
      return data.base_asset.toUpperCase();
    }
    return symbol.replace("USDT", "").toUpperCase();
  }, [data, symbol]);

  useEffect(() => {
    setImageError(false);
  }, [baseAssetCode]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const interval = setTimeout(() => {
      checkScroll();
    }, 300); // chờ DOM render xong

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      clearTimeout(interval);
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const current = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const next =
      direction === "left" ? current - scrollAmount : current + scrollAmount;

    // Cập nhật trước để mũi tên biến mất ngay lập tức
    if (direction === "left") {
      setCanScrollRight(true);
      setCanScrollLeft(next > 0);
    } else {
      setCanScrollLeft(true);
      setCanScrollRight(next < maxScroll);
    }

    // Cuộn thật
    container.scrollTo({
      left: next,
      behavior: "smooth",
    });

    // Kiểm tra lại sau khi scroll smooth xong để đồng bộ chính xác
    setTimeout(checkScroll, 400);
  };

  return (
    <div className="h-[56px] bg-white dark:bg-[#181A20] rounded-[8px] flex px-[16px] relative">
      {isLoading ? null : (
        <>
          <div className="w-[280px] flex items-center gap-[8px] text-[#9c9c9c]">
            <div className="flex justify-center w-6 h-6 items-center mr-[4px] border rounded-[8px] dark:border-gray-600 border-gray-200 cursor-pointer">
              <CiStar className="text-[16px] dark:border-gray-600 border-gray-200" />
            </div>
            <div className="flex justify-center items-center gap-[8px]">
              <div className="">
                <Image
                  key={baseAssetCode}
                  src={
                    imageError
                      ? "/crypto-icons/DEFAULT.webp"
                      : `/crypto-icons/${baseAssetCode}.webp`
                  }
                  alt={symbol}
                  width={24}
                  height={24}
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>
              <div className="pr-[8px]">
                <div className="text-[18px] leading-[20px] text-black dark:text-white font-semibold">
                  {(data?.base_asset || "BTC") +
                    "/" +
                    (data?.quote_asset || "USDT")}
                </div>
                <div className="text-[12px] text-[#9c9c9c] flex gap-[4px] items-center">
                  <Link
                    href={`/price/${baseAssetCode}`}
                    className="font-normal text-[#9c9c9c]"
                  >
                    Giá {marketData?.name}
                  </Link>
                  <MdOutlineArrowOutward className="text-[6px]" />
                </div>
              </div>
            </div>
            <div className="flex justify-center flex-col items-start">
              <div className="text-[20px] text-[#2EBD85] font-semibold leading-[20px]">
                {fmt(marketData?.price || 0)}
              </div>
              <div className="text-[12px] text-black dark:text-white">
                $ {fmt(marketData?.price || 0)}
              </div>
            </div>
          </div>
          <div className="flex-1 flex px-[16px] relative justify-center items-center">
            <button
              onClick={() => scroll("left")}
              className={`absolute left-0 flex items-center justify-center w-6 h-8 rounded z-2 transition-opacity duration-200
    ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <LuChevronLeft className="text-gray-400 hover:text-black dark:hover:text-white" />
            </button>
            {/* Left Fade Gradient */}
            <div
              className={`absolute left-[10px] top-0 w-[40px] h-full bg-gradient-to-r dark:from-[#181A20] from-white to-transparent transition-opacity duration-200 pointer-events-none z-1
  ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
            />

            {/* Right Fade Gradient */}
            <div
              className={`absolute right-[15px] top-0 w-[40px] h-full bg-gradient-to-l dark:from-[#181A20] from-white to-transparent transition-opacity duration-200 pointer-events-none z-1
  ${canScrollRight ? "opacity-100" : "opacity-0"}`}
            />
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-hidden flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-[16px] text-[12px]">
                <div className="flex  flex-col justify-center">
                  <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">
                    Biến động trong 24 giờ
                  </div>
                  <div className="text-[#F6465D]">
                    <span
                      className={`font-medium text-[12px] ${
                        (marketData?.priceChangePercent24h || 0) < 0
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      <div className="flex gap-2">
                        <p>{fmt(marketData?.priceChange24h || 0)}</p>
                        <p>{`${marketData?.priceChangePercent24h || 0}%`}</p>
                      </div>
                    </span>
                  </div>
                </div>
                <div className="flex  flex-col justify-center">
                  <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">
                    Giá cao nhất 24h
                  </div>
                  <div className="font-medium">
                    {fmt(marketData?.highPrice24h || 0)}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">
                    Giá thấp nhất 24h
                  </div>
                  <div className="font-medium">
                    {fmt(marketData?.lowPrice24h || 0)}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">
                    KL 24h({data?.base_asset || "BTC"})
                  </div>
                  <div className="font-medium">
                    {fmt(marketData?.volume24h || 0)}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">
                    KL 24h({data?.quote_asset || "USDT"})
                  </div>
                  <div className="font-medium">
                    {fmt(marketData?.quoteAssetVolume24h || 0)}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">
                    Mạng lưới
                  </div>
                  <hr className="border border-t-0 border-dashed border-[#9c9c9c] " />
                  <div className="font-medium">BTC (5)</div>
                </div>
              </div>
              <div className="flex flex-col justify-center text-[12px] w-[120px] shrink-0">
                <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">
                  Thẻ token
                </div>
                <div className="flex font-medium gap-[4px]">
                  <Link href={"#"} className="text-[#D89F00] whitespace-nowrap">
                    POW
                  </Link>
                  <div className="text-[#9c9c9c]"> | </div>
                  <Link href={"#"} className="text-[#D89F00] whitespace-nowrap">
                    Payments
                  </Link>
                  <div className="text-[#9c9c9c]"> | </div>
                  <Link href={"#"} className="text-[#D89F00] whitespace-nowrap">
                    Khối lượng
                  </Link>
                  <div className="text-[#9c9c9c]"> | </div>
                  <Link href={"#"} className="text-[#D89F00] whitespace-nowrap">
                    Phổ Biến
                  </Link>
                  <div className="text-[#9c9c9c]"> | </div>
                  <Link href={"#"} className="text-[#D89F00] whitespace-nowrap">
                    Price protection
                  </Link>
                </div>
              </div>
            </div>
            {/* Right Button */}
            <button
              onClick={() => scroll("right")}
              className={`absolute right-0 flex items-center justify-center w-6 h-8 rounded z-2 transition-opacity duration-200
    ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <LuChevronRight className="text-gray-400 hover:text-black dark:hover:text-white" />
            </button>
          </div>
        </>
      )}
      <ConnectionStatus connected={connected} />
    </div>
  );
}
