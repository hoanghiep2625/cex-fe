"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function MarketHeader() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    <div className="px-[20px] py-[12px] bg-[#181A20] flex items-center gap-8 rounded-[10px]">
      {/* Left Section - BTC Info */}
      <div className="flex items-center gap-6">
        {/* BTC Icon and Name */}
        <div className="flex items-center gap-2">
          <Image
            src="https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/87496d50-2408-43e1-ad4c-78b47b448a6a.png"
            alt="Bitcoin"
            width={24}
            height={24}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white text-xl font-semibold">BTC/USDT</span>
            </div>
            <span className="text-gray-400 text-xs">Giá Bitcoin</span>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex flex-col">
          <span className="text-green-500 text-xl font-bold">108.650,03</span>
          <span className="text-white text-[12px] font-semibold">
            $108.650,03
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
              <span className="text-red-700 font-semibold text-[12px]">
                -1.483,81 -1,35%
              </span>
            </div>
            <div className="text-white shrink-0">
              <div>
                <p className="text-[12px] text-gray-400">Giá cao nhất 24h</p>
              </div>
              <span className="text-[12px] font-semibold">111.732,01</span>
            </div>
            <div className="text-white shrink-0">
              <div>
                <p className="text-[12px] text-gray-400">Giá thấp nhất 24h</p>
              </div>
              <span className="text-[12px] font-semibold">107.732,01</span>
            </div>
            <div className="text-white shrink-0">
              <div>
                <p className="text-[12px] text-gray-400">KL 24h(BTC)</p>
              </div>
              <span className="text-[12px] font-semibold">18.866,88</span>
            </div>
            <div className="text-white shrink-0">
              <div>
                <p className="text-[12px] text-gray-400">KL 24h(USDT)</p>
              </div>
              <span className=" text-[12px] font-semibold">
                2.084.702.661,81
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
