"use client";

import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { useSymbol } from "@/context/SymbolContext";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { CircleAlert, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import TabUnderline from "@/components/ui/TabUnderline";
import NumberInput from "@/components/ui/NumberInput";

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
  const [activeTab, setActiveTab] = useState("spot");
  // Buy form state
  const [buyPrice, setBuyPrice] = useState("");
  const [buyQty, setBuyQty] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);

  // Sell form state
  const [sellPrice, setSellPrice] = useState("");
  const [sellQty, setSellQty] = useState("");
  const [sellLoading, setSellLoading] = useState(false);

  // Calculate totals
  const buyTotal =
    buyPrice && buyQty
      ? (parseFloat(buyPrice) * parseFloat(buyQty)).toFixed(8)
      : "0";
  const sellTotal =
    sellPrice && sellQty
      ? (parseFloat(sellPrice) * parseFloat(sellQty)).toFixed(8)
      : "0";

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

      const symbolCode = symbol?.code || pair.replace("_", "");
      const orderData = {
        symbol: symbolCode,
        side: "BUY",
        type: orderType === "limit" ? "LIMIT" : orderType.toUpperCase(),
        price: buyPrice,
        qty: buyQty,
        tif: "GTC",
        client_order_id: `buy_${Date.now()}`,
      };

      console.log("Placing buy order:", orderData);
      const response = await axiosInstance.post("/orders", orderData);

      toast.success(`Lệnh mua thành công!`);
      setBuyPrice("");
      setBuyQty("");
      fetchBalance(); // Refresh balance
    } catch (error) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Lỗi khi đặt lệnh mua";
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

      const symbolCode = symbol?.code || pair.replace("_", "");
      const orderData = {
        symbol: symbolCode,
        side: "SELL",
        type: orderType === "limit" ? "LIMIT" : orderType.toUpperCase(),
        price: sellPrice,
        qty: sellQty,
        tif: "GTC",
        client_order_id: `sell_${Date.now()}`,
      };

      console.log("Placing sell order:", orderData);
      const response = await axiosInstance.post("/orders", orderData);

      toast.success(`Lệnh bán thành công!`);
      setSellPrice("");
      setSellQty("");
      fetchBalance(); // Refresh balance
    } catch (error) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Lỗi khi đặt lệnh bán";
      toast.error(`❌ ${errorMsg}`);
      console.error("Error placing sell order:", error);
    } finally {
      setSellLoading(false);
    }
  };

  // Get base and quote currency from pair prop (BTC_USDT → BTC, USDT)
  const [baseCurrency, quoteCurrency] = pair.split("_");
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
          <TabUnderline
            className="text-xs font-semibold pb-2"
            active={activeTab === "spot"}
            onClick={() => setActiveTab("spot")}
          >
            Spot
          </TabUnderline>
          <TabUnderline
            className="text-xs font-semibold pb-2"
            active={activeTab === "cross"}
            onClick={() => setActiveTab("cross")}
          >
            Cross Margin
          </TabUnderline>
          <TabUnderline
            className="text-xs font-semibold pb-2"
            active={activeTab === "isolated"}
            onClick={() => setActiveTab("isolated")}
          >
            Isolated
          </TabUnderline>
          <TabUnderline
            className="text-xs font-semibold pb-2"
            active={activeTab === "luoi"}
            onClick={() => setActiveTab("luoi")}
          >
            Lưới
          </TabUnderline>
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
            <NumberInput
              label="Giá"
              value={buyPrice}
              onChange={setBuyPrice}
              unit={quoteCurrency}
              showButtons={true}
            />

            <NumberInput
              label="Số lượng"
              value={buyQty}
              onChange={setBuyQty}
              unit={baseCurrency}
              showButtons={true}
            />

            {/* Slider */}
            <div className="">
              <input type="range" className="w-full h-0.5 " />
            </div>

            <NumberInput
              label="Tổng"
              value={buyTotal}
              onChange={() => {}}
              unit={quoteCurrency}
              readOnly={true}
              showButtons={false}
            />

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
            <NumberInput
              label="Giá"
              value={sellPrice}
              onChange={setSellPrice}
              unit={quoteCurrency}
              showButtons={true}
            />

            <NumberInput
              label="Số lượng"
              value={sellQty}
              onChange={setSellQty}
              unit={baseCurrency}
              showButtons={true}
            />

            {/* Slider */}
            <div className="">
              <input type="range" className="w-full h-0.5 " />
            </div>

            <NumberInput
              label="Tổng"
              value={sellTotal}
              onChange={() => {}}
              unit={quoteCurrency}
              readOnly={true}
              showButtons={false}
            />

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
