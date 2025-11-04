"use client";

import AdjustIcon from "@/components/icons/AdjustIcon";
import { useTicker } from "@/hooks/useTicker";
import { formatPrice } from "@/lib/formatters";
import { LuSignal } from "react-icons/lu";

export default function GlobalStatusBar() {
  const { tickers, connected } = useTicker({
    quoteAsset: "USDT",
    type: "spot",
  });

  const tradingPairs =
    tickers?.map((sym) => ({
      symbol: `${sym.base_asset}/${sym.quote_asset}`,
      price: formatPrice(sym.price || 0),
      change: `${sym.priceChangePercent24h >= 0 ? "+" : ""}${formatPrice(
        Math.abs(sym.priceChangePercent24h || 0)
      )}%`,
    })) || [];

  const connectionStatus = connected ? "Kết nối ổn định" : "Mất kết nối";

  return (
    <div className="fixed bottom-0 left-0 right-0 dark:bg-[#181A20] bg-white w-full overflow-hidden py-1 z-50 border-t-4 dark:border-[#0f1119] border-gray-100">
      <div className="flex gap-2 text-xs items-center justify-between dark:text-white text-black px-4">
        <div
          className={`flex gap-2 w-[110px] items-center shrink-0 ${
            connected ? "text-green-500" : "text-gray-500"
          }`}
        >
          <LuSignal />
          {connectionStatus}
        </div>
        <div className="w-[70%] flex items-center flex-row gap-1">
          <AdjustIcon
            size={16}
            className="text-muted-foreground hover:text-foreground text-gray-400"
          />
          <div className="overflow-hidden flex-1">
            <div className=" animate-scroll flex gap-6 whitespace-nowrap ">
              {tradingPairs.length > 0 &&
                [...tradingPairs, ...tradingPairs].map((ticker, idx) => (
                  <div
                    key={`${ticker.symbol}-${idx}`}
                    className="flex items-center gap-1 shrink-0 min-w-[90px]"
                  >
                    <span className="font-semibold w-[70px] text-left">
                      {ticker.symbol}
                    </span>
                    <span
                      className={`${
                        ticker.change.startsWith("+")
                          ? "text-green-500"
                          : "text-red-500"
                      } w-10 text-left`}
                    >
                      {ticker.change}
                    </span>
                    <span className="dark:text-gray-300 text-gray-600 w-20 text-left">
                      {ticker.price}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="text-gray-300">|</div>
        <div className="flex gap-4 justify-end w-72 shrink-0 text-xs">
          <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
            Thông báo
          </div>
          <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
            Tuỳ chọn Cookie
          </div>
          <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
            Hỗ trợ trực tuyến
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
