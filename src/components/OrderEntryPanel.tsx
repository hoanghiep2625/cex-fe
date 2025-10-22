"use client";

import { CircleAlert } from "lucide-react";
import { useState } from "react";

export default function OrderEntryPanel() {
  const [accountType, setAccountType] = useState<
    "spot" | "cross" | "isolated" | "luoi"
  >("spot");
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">(
    "limit"
  );

  return (
    <>
      <style>{`
        input[type='range'] {
          appearance: none;
          width: 100%;
          height: 2px;
          border-radius: 5px;
          background: linear-gradient(to right, #374151 0%, #374151 100%);
          outline: none;
          background-image: 
            linear-gradient(to right,
              #374151 0%,
              #374151 5%, 
              transparent 5%, 
              transparent 10%,
              #374151 10%,
              #374151 15%,
              transparent 15%,
              transparent 20%,
              #374151 20%,
              #374151 25%,
              transparent 25%,
              transparent 30%,
              #374151 30%,
              #374151 35%,
              transparent 35%,
              transparent 40%,
              #374151 40%,
              #374151 45%,
              transparent 45%,
              transparent 50%,
              #374151 50%,
              #374151 55%,
              transparent 55%,
              transparent 60%,
              #374151 60%,
              #374151 65%,
              transparent 65%,
              transparent 70%,
              #374151 70%,
              #374151 75%,
              transparent 75%,
              transparent 80%,
              #374151 80%,
              #374151 85%,
              transparent 85%,
              transparent 90%,
              #374151 90%,
              #374151 95%,
              transparent 95%,
              transparent 100%
            );
          background-size: 100% 100%;
          background-position: 0 0;
          background-repeat: no-repeat;
        }

        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid white;
          background: transparent;
          cursor: pointer;
          filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
        }

        input[type='range']::-moz-range-thumb {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid white;
          background: transparent;
          cursor: pointer;
          border: none;
          filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
        }

        input[type='range']::-webkit-slider-runnable-track {
          appearance: none;
          width: 100%;
          height: 2px;
          background: #374151;
          border-radius: 5px;
        }

        input[type='range']::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
      <div className="flex-1 bg-[#181A20] rounded-[10px] text-white flex flex-col">
        {/* Account Type Tabs */}
        <div className="px-4 pt-3 border-b border-gray-700 flex items-center gap-6">
          <div className="relative inline-flex">
            <button
              onClick={() => setAccountType("spot")}
              className={`pb-2 text-[12px] font-semibold ${
                accountType === "spot" ? "text-white" : "text-gray-400"
              }`}
            >
              Spot
            </button>
            {accountType === "spot" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[16px] h-[3px] bg-yellow-400" />
            )}
          </div>
          <div className="relative inline-flex">
            <button
              onClick={() => setAccountType("cross")}
              className={`pb-2 text-[12px] font-semibold ${
                accountType === "cross" ? "text-white" : "text-gray-400"
              }`}
            >
              Cross Margin
            </button>
            {accountType === "cross" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[16px] h-[3px] bg-yellow-400" />
            )}
          </div>
          <div className="relative inline-flex">
            <button
              onClick={() => setAccountType("isolated")}
              className={`pb-2 text-[12px] font-semibold ${
                accountType === "isolated" ? "text-white" : "text-gray-400"
              }`}
            >
              Isolated
            </button>
            {accountType === "isolated" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[16px] h-[3px] bg-yellow-400" />
            )}
          </div>
          <div className="relative inline-flex">
            <button
              onClick={() => setAccountType("luoi")}
              className={`pb-2 text-[12px] font-semibold ${
                accountType === "luoi" ? "text-white" : "text-gray-400"
              }`}
            >
              Lưới
            </button>
            {accountType === "luoi" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[16px] h-[3px] bg-yellow-400" />
            )}
          </div>
        </div>

        {/* Order Type Selection */}
        <div className="px-4 py-3 flex items-center gap-6">
          <button
            onClick={() => setOrderType("limit")}
            className={`text-[12px] font-semibold ${
              orderType === "limit" ? "text-white" : "text-gray-400"
            }`}
          >
            Giới hạn
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={`text-[12px] font-semibold ${
              orderType === "market" ? "text-white" : "text-gray-400"
            }`}
          >
            Thị trường
          </button>
          <button
            onClick={() => setOrderType("stop")}
            className={`text-[12px] font-semibold flex items-center gap-1 ${
              orderType === "stop" ? "text-white" : "text-gray-400"
            }`}
          >
            Stop Limit
            <span className="text-xs">▼</span>
          </button>
          <button className="text-gray-400 hover:text-white ">
            <CircleAlert width={16} height={16} />
          </button>
        </div>

        {/* Buy/Sell Forms */}
        <div className="flex-1 px-4 pb-3 grid grid-cols-2 gap-4 overflow-y-auto">
          {/* BUY FORM */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center rounded  border border-gray-700 px-3 py-2">
                <input
                  type="text"
                  placeholder="Giá"
                  className="bg-transparent flex-1 outline-none text-sm"
                />
                <div className="flex flex-col gap-0">
                  <button className="text-xs text-gray-400 hover:text-white leading-none">
                    ▲
                  </button>
                  <button className="text-xs text-gray-400 hover:text-white leading-none">
                    ▼
                  </button>
                </div>
                <span className="text-xs text-gray-400 ml-2">BTC</span>
              </div>
            </div>

            <div>
              <div className="flex items-center rounded border border-gray-700 px-3 py-2">
                <input
                  type="text"
                  placeholder="Số lượng"
                  className="bg-transparent flex-1 outline-none text-sm"
                />
                <div className="flex flex-col gap-0">
                  <button className="text-xs text-gray-400 hover:text-white leading-none">
                    ▲
                  </button>
                  <button className="text-xs text-gray-400 hover:text-white leading-none">
                    ▼
                  </button>
                </div>
                <span className="text-xs text-gray-400 ml-2">BTC</span>
              </div>
            </div>

            {/* Slider */}
            <div className="">
              <input type="range" className="w-full" />
            </div>

            {/* TP/SL */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="tp-buy" className="w-4 h-4" />
              <label htmlFor="tp-buy" className="text-xs text-white">
                TP/SL
              </label>
            </div>

            {/* Available */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-white">
                <span className="text-gray-500">Khả dụng</span>
                <span>- USDT</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="underline text-gray-500">Mua tối đa</span>
                <span>-- BTC</span>
              </div>
            </div>

            {/* Buy Button */}
            <button className="w-full bg-green-400 hover:bg-green-500 text-white font-semibold py-2.5 rounded text-sm h-[36px] flex items-center justify-center">
              Đăng nhập
            </button>
          </div>

          {/* SELL FORM */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 rounded px-3 py-2 border border-gray-700">
                <input
                  type="text"
                  placeholder="Giá"
                  defaultValue="107.717,47"
                  className="bg-transparent flex-1 outline-none text-sm"
                />
                <div className="flex flex-col gap-0">
                  <button className="text-xs text-gray-400 hover:text-white leading-none">
                    ▲
                  </button>
                  <button className="text-xs text-gray-400 hover:text-white leading-none">
                    ▼
                  </button>
                </div>
                <span className="text-xs text-gray-400 ml-2">USDT</span>
              </div>
            </div>

            <div>
              <div className="flex items-center rounded border border-gray-700 px-3 py-2">
                <input
                  type="text"
                  placeholder="Số lượng"
                  className="bg-transparent flex-1 outline-none text-sm"
                />
                <div className="flex flex-col gap-0">
                  <button className="text-xs text-gray-400 hover:text-white leading-none">
                    ▲
                  </button>
                  <button className="text-xs text-gray-400 hover:text-white leading-none">
                    ▼
                  </button>
                </div>
                <span className="text-xs text-gray-400 ml-2">BTC</span>
              </div>
            </div>

            {/* Slider */}
            <div className="">
              <input type="range" className="w-full" />
            </div>

            {/* TP/SL */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="tp-sell" className="w-4 h-4" />
              <label htmlFor="tp-sell" className="text-xs text-white">
                TP/SL
              </label>
            </div>

            {/* Available */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-white">
                <span className="text-gray-500">Khả dụng</span>
                <span>- BTC</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="underline text-gray-500">Bán tối đa</span>
                <span>-- USDT</span>
              </div>
            </div>

            {/* Sell Button */}
            <button className="w-full bg-red-400 hover:bg-red-500 text-white font-semibold py-2.5 rounded text-sm h-[36px] flex items-center justify-center">
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
