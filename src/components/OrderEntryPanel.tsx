"use client";

import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { useSymbol } from "@/context/SymbolContext";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { CircleAlert, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function OrderEntryPanel({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [accountType, setAccountType] = useState<
    "spot" | "cross" | "isolated" | "luoi"
  >("spot");
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">(
    "limit"
  );
  const { user, loading, isAuthenticated } = useAuth();
  const { balances, balanceLoading, fetchBalance } = useBalance();
  const { symbol } = useSymbol();

  // Buy form state
  const [buyPrice, setBuyPrice] = useState("");
  const [buyQty, setBuyQty] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);

  // Sell form state
  const [sellPrice, setSellPrice] = useState("");
  const [sellQty, setSellQty] = useState("");
  const [sellLoading, setSellLoading] = useState(false);

  // Fetch balance khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && !loading) {
      fetchBalance();
    }
  }, [isAuthenticated, loading, fetchBalance]);

  // Submit buy order
  const handleBuyOrder = async () => {
    if (!buyPrice || !buyQty) {
      toast.error("Vui lòng nhập giá và số lượng");
      return;
    }

    try {
      setBuyLoading(true);

      const orderData = {
        symbol: symbol?.code || "BTCUSDT",
        side: "BUY",
        type: orderType === "limit" ? "LIMIT" : orderType.toUpperCase(),
        price: buyPrice,
        qty: buyQty,
        tif: "GTC",
        client_order_id: `buy_${Date.now()}`,
      };

      console.log("Placing buy order:", orderData);
      const response = await axiosInstance.post("/orders", orderData);

      toast.success(
        `✅ Lệnh mua thành công! Order ID: ${response.data.data?.orderId}`
      );
      setBuyPrice("");
      setBuyQty("");
      fetchBalance(); // Refresh balance
    } catch (error) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Lỗi khi đặt lệnh mua";
      toast.error(`❌ ${errorMsg}`);
      console.error("Error placing buy order:", error);
    } finally {
      setBuyLoading(false);
    }
  };

  // Submit sell order
  const handleSellOrder = async () => {
    if (!sellPrice || !sellQty) {
      toast.error("Vui lòng nhập giá và số lượng");
      return;
    }

    try {
      setSellLoading(true);

      const orderData = {
        symbol: symbol?.code || "BTCUSDT",
        side: "SELL",
        type: orderType === "limit" ? "LIMIT" : orderType.toUpperCase(),
        price: sellPrice,
        qty: sellQty,
        tif: "GTC",
        client_order_id: `sell_${Date.now()}`,
      };

      console.log("Placing sell order:", orderData);
      const response = await axiosInstance.post("/orders", orderData);

      toast.success(
        `✅ Lệnh bán thành công! Order ID: ${response.data.data?.orderId}`
      );
      setSellPrice("");
      setSellQty("");
      fetchBalance(); // Refresh balance
    } catch (error) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Lỗi khi đặt lệnh bán";
      toast.error(`❌ ${errorMsg}`);
      console.error("Error placing sell order:", error);
    } finally {
      setSellLoading(false);
    }
  };

  // Get base and quote currency from symbol context
  const baseCurrency = symbol?.baseAsset || "BTC";
  const quoteCurrency = symbol?.quoteAsset || "USDT";
  // Get balances for the current trading pair
  const baseAssetBalance =
    balances.find((b) => b.currency === baseCurrency)?.available || "0";
  const quoteAssetBalance =
    balances.find((b) => b.currency === quoteCurrency)?.available || "0";

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
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
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
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
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
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
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
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
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
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      placeholder="0"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold bg-transparent placeholder-gray-600"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">
                    {quoteCurrency}
                  </div>
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
                      value={buyQty}
                      onChange={(e) => setBuyQty(e.target.value)}
                      placeholder="0"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold bg-transparent placeholder-gray-600"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">
                    {baseCurrency}
                  </div>
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
              <input type="range" className="w-full h-0.5 " />
            </div>

            <div className="flex">
              <div className="border border-gray-700 rounded-md w-full p-2 flex justify-between items-center">
                <div className="text-xs text-gray-400 font-semibold">Tổng</div>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tối thiểu 5"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold bg-transparent placeholder-gray-600"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">
                    {quoteCurrency}
                  </div>
                </div>
              </div>
            </div>

            {/* Available - BUY */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-white">
                <span className="text-gray-500">Khả dụng</span>
                <div className="flex items-center gap-1">
                  <span>
                    {balanceLoading
                      ? "-"
                      : parseFloat(quoteAssetBalance).toFixed(8)}{" "}
                    {quoteCurrency}
                  </span>
                  <div className="rounded-full bg-yellow-400 w-4 h-4 flex items-center justify-center text-sm text-[#181A20]">
                    <Plus width={12} height={12} />
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-white">
                <span className="underline text-gray-500">Mua tối đa</span>
                <span>
                  {balanceLoading
                    ? "--"
                    : (parseFloat(quoteAssetBalance) / 100000).toFixed(8)}{" "}
                  {baseCurrency}
                </span>
              </div>
            </div>

            {!isAuthenticated ? (
              <Link
                href="/login"
                className="w-full bg-green-400 hover:bg-green-500 text-white font-semibold py-2.5 rounded text-sm h-9 flex items-center justify-center"
              >
                Đăng nhập
              </Link>
            ) : (
              <button
                onClick={handleBuyOrder}
                disabled={buyLoading}
                className="w-full bg-green-400 hover:bg-green-500 disabled:bg-gray-500 text-white font-semibold py-2.5 rounded text-sm h-9 flex items-center justify-center"
              >
                {buyLoading ? "Đang xử lý..." : `Mua ${baseCurrency}`}
              </button>
            )}
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
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      placeholder="0"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold bg-transparent placeholder-gray-600"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">
                    {quoteCurrency}
                  </div>
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
                      value={sellQty}
                      onChange={(e) => setSellQty(e.target.value)}
                      placeholder="0"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold bg-transparent placeholder-gray-600"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">
                    {baseCurrency}
                  </div>
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
              <input type="range" className="w-full h-0.5 " />
            </div>

            <div className="flex">
              <div className="border border-gray-700 rounded-md w-full p-2 flex justify-between items-center">
                <div className="text-xs text-gray-400 font-semibold">Tổng</div>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tối thiểu 5"
                      className="w-full outline-none text-sm text-right items-center flex text-white font-semibold"
                    />
                  </div>
                  <div className="text-sm text-white font-semibold">
                    {quoteCurrency}
                  </div>
                </div>
              </div>
            </div>

            {/* Available - SELL */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-white">
                <span className="text-gray-500">Khả dụng</span>
                <span>
                  {balanceLoading
                    ? "-"
                    : parseFloat(baseAssetBalance).toFixed(8)}{" "}
                  {baseCurrency}
                </span>
              </div>
              <div className="flex justify-between text-white">
                <span className="underline text-gray-500">Bán tối đa</span>
                <span>
                  {balanceLoading
                    ? "--"
                    : (parseFloat(baseAssetBalance) * 100000).toFixed(8)}{" "}
                  {quoteCurrency}
                </span>
              </div>
            </div>

            {/* Sell Button */}
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="w-full bg-red-400 hover:bg-red-500 text-white font-semibold py-2.5 rounded text-sm h-9 flex items-center justify-center"
              >
                Đăng nhập
              </Link>
            ) : (
              <button
                onClick={handleSellOrder}
                disabled={sellLoading}
                className="w-full bg-red-400 hover:bg-red-500 disabled:bg-gray-500 text-white font-semibold py-2.5 rounded text-sm h-9 flex items-center justify-center"
              >
                {sellLoading ? "Đang xử lý..." : `Bán ${baseCurrency}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
