"use client";

interface BalanceData {
  [currency: string]: {
    available: string;
    locked: string;
    total: string;
  };
}

import { useAuth } from "@/hooks/useAuth";
import { useSymbol } from "@/context/SymbolContext";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState, useEffect } from "react";
import TabUnderline from "@/components/ui/TabUnderline";
import NumberInput from "@/components/ui/NumberInput";
import { LuCircleAlert, LuPlus } from "react-icons/lu";
import { IoMdArrowDropdown } from "react-icons/io";
import { useBalance, useMarketData } from "@/hooks/useWebSocket";
import { useQuery } from "@tanstack/react-query";

export default function OrderEntryPanel({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">(
    "limit"
  );
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { symbol } = useSymbol();

  const [baseCurrency = "", quoteCurrency = ""] = (pair ?? "").split("_");

  const walletType =
    type === "spot" ? "spot" : type === "futures" ? "future" : "funding";

  const symbolCode = pair.replace("_", "");
  const { data: initialBalances, isLoading: balanceLoading } =
    useQuery<BalanceData>({
      queryKey: ["balance", symbolCode, walletType],
      queryFn: () =>
        axiosInstance
          .get(`/balance/symbol/${symbolCode}`, {
            params: { wallet_type: walletType },
          })
          .then((r) => r.data?.data || {}),
      refetchOnWindowFocus: false,
      enabled: isAuthenticated,
    });

  const { balances: wsBalances } = useBalance(symbolCode, walletType);
  const { marketData: wsMarketData } = useMarketData(symbolCode, type);
  const { data: initialMarketData } = useQuery({
    queryKey: ["marketData", symbolCode, type],
    queryFn: () =>
      axiosInstance
        .get(`/symbols/market-data/${symbolCode}`, {
          params: { type },
        })
        .then((r) => r.data?.data || {}),
    refetchOnWindowFocus: false,
  });

  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [marketData, setMarketData] = useState<{
    price?: number;
    currentPrice?: number;
  } | null>(null);

  // Set initial balances
  useEffect(() => {
    if (initialBalances && Object.keys(initialBalances).length > 0) {
      setBalances(initialBalances);
    }
  }, [initialBalances]);

  // Update balances from WebSocket
  useEffect(() => {
    if (wsBalances && Object.keys(wsBalances as Record<string, unknown>).length > 0) {
      setBalances(wsBalances as BalanceData);
    }
  }, [wsBalances]);

  // Set initial market data
  useEffect(() => {
    if (initialMarketData) {
      setMarketData(
        initialMarketData as { price?: number; currentPrice?: number }
      );
    }
  }, [initialMarketData]);

  // Update market data from WebSocket
  useEffect(() => {
    if (wsMarketData) {
      setMarketData(wsMarketData as { price?: number; currentPrice?: number });
    }
  }, [wsMarketData]);

  const currentPrice = marketData?.currentPrice || marketData?.price || 0;
  const loading = balanceLoading;
  const [activeTab, setActiveTab] = useState("spot");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyQty, setBuyQty] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [sellQty, setSellQty] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const buyTotal =
    buyPrice && buyQty
      ? (parseFloat(buyPrice) * parseFloat(buyQty)).toFixed(8)
      : "0";
  const sellTotal =
    sellPrice && sellQty
      ? (parseFloat(sellPrice) * parseFloat(sellQty)).toFixed(8)
      : "0";

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
      await axiosInstance.post("/orders", orderData);

      toast.success(`Lệnh mua thành công!`);
      setBuyPrice("");
      setBuyQty("");
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
      await axiosInstance.post("/orders", orderData);

      toast.success(`Lệnh bán thành công!`);
      setSellPrice("");
      setSellQty("");
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

  // Get balances from WebSocket hook
  const baseAssetBalance =
    balances && balances[baseCurrency]
      ? parseFloat(balances[baseCurrency].available).toFixed(8)
      : "0";
  const quoteAssetBalance =
    balances && balances[quoteCurrency]
      ? parseFloat(balances[quoteCurrency].available).toFixed(8)
      : "0";

  return (
    <>
      <div className="relative flex-1 dark:bg-[#181A20] bg-white rounded-[10px] dark:text-white text-black flex flex-col">
        {authLoading ? (
          <div></div>
        ) : (
          <div>
            <div className="px-4 pt-3 dark:border-b dark:border-gray-700 border-b border-gray-200 flex items-center gap-6">
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

            <div className="px-4 py-3 flex items-center gap-6">
              <button
                onClick={() => setOrderType("limit")}
                className={`text-[12px] font-semibold ${
                  orderType === "limit"
                    ? "dark:text-white text-black"
                    : "dark:text-gray-400 text-gray-400 hover:dark:text-white hover:text-black"
                }`}
              >
                Giới hạn
              </button>
              <button
                onClick={() => setOrderType("market")}
                className={`text-[12px] font-semibold ${
                  orderType === "market"
                    ? "dark:text-white text-black"
                    : "dark:text-gray-400 text-gray-400 hover:dark:text-white hover:text-black"
                }`}
              >
                Thị trường
              </button>
              <button
                onClick={() => setOrderType("stop")}
                className={`text-[12px] font-semibold flex items-center gap-1 ${
                  orderType === "stop"
                    ? "dark:text-white text-black"
                    : "dark:text-gray-400 text-gray-400 hover:dark:text-white hover:text-black"
                }`}
              >
                Stop Limit
                <span className="text-xs">
                  <IoMdArrowDropdown className="w-4 h-4" />
                </span>
              </button>
              <button className="text-gray-400 hover:dark:text-gray-200 hover:text-gray-800">
                <LuCircleAlert width={16} height={16} />
              </button>
            </div>

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
                  rounded="rounded-md"
                />

                {/* Available - BUY */}
                <div className="text-xs space-y-1">
                  <div className="flex justify-between dark:text-white text-black">
                    <span className="dark:text-gray-500 text-gray-400">
                      Khả dụng
                    </span>
                    <div className="flex items-center gap-1">
                      <span>
                        {loading ? "--" : quoteAssetBalance} {quoteCurrency}
                      </span>
                      <div className="rounded-full bg-yellow-400 w-4 h-4 flex items-center justify-center text-sm text-[#181A20]">
                        <LuPlus
                          width={12}
                          height={12}
                          className="text-white dark:text-[#181A20]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between dark:text-white text-black">
                    <span className="underline dark:text-gray-500 text-gray-400">
                      Mua tối đa
                    </span>
                    <span>
                      {loading || !currentPrice
                        ? "--"
                        : (
                            parseFloat(quoteAssetBalance) / currentPrice
                          ).toFixed(8)}{" "}
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
                  rounded="rounded-md"
                />

                {/* Available - SELL */}
                <div className="text-xs space-y-1">
                  <div className="flex justify-between dark:text-white text-black">
                    <span className="dark:text-gray-500 text-gray-400">
                      Khả dụng
                    </span>
                    <span>
                      {loading ? "-" : baseAssetBalance} {baseCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between dark:text-white text-black">
                    <span className="underline dark:text-gray-500 text-gray-400">
                      Bán tối đa
                    </span>
                    <span>
                      {loading || !currentPrice
                        ? "--"
                        : (parseFloat(baseAssetBalance) * currentPrice).toFixed(
                            8
                          )}{" "}
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
        )}
      </div>
    </>
  );
}
