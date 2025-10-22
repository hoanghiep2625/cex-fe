"use client";

import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function OrderEntryPanel() {
  const [accountType, setAccountType] = useState<
    "spot" | "cross" | "isolated" | "luoi"
  >("spot");
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">(
    "limit"
  );
  const { user, loading, isAuthenticated } = useAuth();
  const { balances, balanceLoading, fetchBalance } = useBalance();

  // Fetch balance khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && !loading) {
      fetchBalance();
    }
  }, [isAuthenticated, loading, fetchBalance]);

  // Get BTC and USDT balances
  const btcBalance =
    balances.find((b) => b.currency === "BTC")?.available || "0";
  const usdtBalance =
    balances.find((b) => b.currency === "USDT")?.available || "0";
  return (
    <>
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
            {/* Giá */}
            <div className="flex">
              <div className="border border-gray-700 rounded-md rounded-r-none w-full p-2 flex justify-between items-center">
                <div className="text-xs text-gray-400 font-semibold">Giá</div>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">USDT</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-6 gap-1 border border-l-0 border-gray-700 rounded-r-md">
                <button className="text-[8px] text-gray-400 hover:text-white leading-none">
                  ▲
                </button>
                <hr className="w-full border-gray-700" />
                <button className="text-[8px] text-gray-400 hover:text-white leading-none">
                  ▼
                </button>
              </div>
            </div>

            <div className="flex">
              <div className="border border-gray-700 rounded-md rounded-r-none w-full p-2 flex justify-between items-center">
                <div className="text-xs text-gray-400 font-semibold">
                  Số lượng
                </div>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">BTC</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-6 gap-1 border border-l-0 border-gray-700 rounded-r-md">
                <button className="text-[8px] text-gray-400 hover:text-white leading-none">
                  ▲
                </button>
                <hr className="w-full border-gray-700" />
                <button className="text-[8px] text-gray-400 hover:text-white leading-none">
                  ▼
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="">
              <input type="range" className="w-full h-[2px] " />
            </div>

            {/* TP/SL */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="tp-buy" className="w-4 h-4" />
              <label htmlFor="tp-buy" className="text-xs text-white">
                TP/SL
              </label>
            </div>

            {/* Available - BUY */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-white">
                <span className="text-gray-500">Khả dụng</span>
                <span>
                  {balanceLoading ? "-" : parseFloat(usdtBalance).toFixed(8)}{" "}
                  USDT
                </span>
              </div>
              <div className="flex justify-between text-white">
                <span className="underline text-gray-500">Mua tối đa</span>
                <span>
                  {balanceLoading
                    ? "--"
                    : (parseFloat(usdtBalance) / 100000).toFixed(8)}{" "}
                  BTC
                </span>
              </div>
            </div>

            {/* Buy Button */}
            <Link
              href="/login"
              className="w-full bg-green-400 hover:bg-green-500 text-white font-semibold py-2.5 rounded text-sm h-[36px] flex items-center justify-center"
            >
              Đăng nhập
            </Link>
          </div>

          {/* SELL FORM */}
          <div className="space-y-3">
            <div className="flex">
              <div className="border border-gray-700 rounded-md rounded-r-none w-full p-2 flex justify-between items-center">
                <div className="text-xs text-gray-400 font-semibold">Giá</div>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">USDT</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-6 gap-1 border border-l-0 border-gray-700 rounded-r-md">
                <button className="text-[8px] text-gray-400 hover:text-white leading-none">
                  ▲
                </button>
                <hr className="w-full border-gray-700" />
                <button className="text-[8px] text-gray-400 hover:text-white leading-none">
                  ▼
                </button>
              </div>
            </div>

            <div className="flex">
              <div className="border border-gray-700 rounded-md rounded-r-none w-full p-2 flex justify-between items-center">
                <div className="text-xs text-gray-400 font-semibold">
                  Số lượng
                </div>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">BTC</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-6 gap-1 border border-l-0 border-gray-700 rounded-r-md">
                <button className="text-[8px] text-gray-400 hover:text-white leading-none">
                  ▲
                </button>
                <hr className="w-full border-gray-700" />
                <button className="text-[8px] text-gray-400 hover:text-white leading-none">
                  ▼
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="">
              <input type="range" className="w-full h-[2px] " />
            </div>

            {/* TP/SL */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="tp-sell" className="w-4 h-4" />
              <label htmlFor="tp-sell" className="text-xs text-white">
                TP/SL
              </label>
            </div>

            {/* Available - SELL */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-white">
                <span className="text-gray-500">Khả dụng</span>
                <span>
                  {balanceLoading ? "-" : parseFloat(btcBalance).toFixed(8)} BTC
                </span>
              </div>
              <div className="flex justify-between text-white">
                <span className="underline text-gray-500">Bán tối đa</span>
                <span>
                  {balanceLoading
                    ? "--"
                    : (parseFloat(btcBalance) * 100000).toFixed(8)}{" "}
                  USDT
                </span>
              </div>
            </div>

            {/* Sell Button */}
            <Link
              href="/login"
              className="w-full bg-red-400 hover:bg-red-500 text-white font-semibold py-2.5 rounded text-sm h-[36px] flex items-center justify-center"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
