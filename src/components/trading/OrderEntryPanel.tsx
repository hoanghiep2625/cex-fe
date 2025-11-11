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
import { LuPlus } from "react-icons/lu";
import { useBalance } from "@/hooks/useWebSocket";
import { useQuery } from "@tanstack/react-query";
import { MarketData } from "@/types";
import InputRange from "@/components/ui/InputRange";

export default function OrderEntryPanel({
  pair,
  type,
  marketData,
}: {
  pair: string;
  type: string;
  marketData: MarketData;
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

  const [balances, setBalances] = useState<BalanceData | null>(null);

  // Set initial balances
  useEffect(() => {
    if (initialBalances && Object.keys(initialBalances).length > 0) {
      setBalances(initialBalances);
    }
  }, [initialBalances]);

  // Update balances from WebSocket
  useEffect(() => {
    if (
      wsBalances &&
      Object.keys(wsBalances as Record<string, unknown>).length > 0
    ) {
      setBalances(wsBalances as BalanceData);
    }
  }, [wsBalances]);

  const currentPrice = marketData?.price || 0;
  const loading = balanceLoading;
  const [activeTab, setActiveTab] = useState("spot");

  // Limit order states
  const [buyPrice, setBuyPrice] = useState("");
  const [buyQty, setBuyQty] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellPrice, setSellPrice] = useState("");
  const [sellQty, setSellQty] = useState("");
  const [sellLoading, setSellLoading] = useState(false);

  // Market order states
  const [buyMarketQty, setBuyMarketQty] = useState("");
  const [sellMarketQty, setSellMarketQty] = useState("");
  const [buyMarketAsset, setBuyMarketAsset] = useState(quoteCurrency); // Mặc định mua bằng USDT
  const [sellMarketAsset, setSellMarketAsset] = useState(baseCurrency); // Mặc định bán BTC
  const [buySliderValue, setBuySliderValue] = useState(0);
  const [sellSliderValue, setSellSliderValue] = useState(0);

  // Recalculate buy quantity when market asset changes
  useEffect(() => {
    if (buySliderValue > 0) {
      if (buyMarketAsset === quoteCurrency) {
        const maxBuyQty = parseFloat(quoteAssetBalance || "0");
        const qty = ((buySliderValue / 100) * maxBuyQty).toFixed(8);
        setBuyMarketQty(qty);
      } else {
        const maxBuyQty = parseFloat(quoteAssetBalance) / currentPrice;
        const qty = ((buySliderValue / 100) * maxBuyQty).toFixed(8);
        setBuyMarketQty(qty);
      }
    }
  }, [buyMarketAsset, buySliderValue]);

  // Recalculate sell quantity when market asset changes
  useEffect(() => {
    if (sellSliderValue > 0) {
      if (sellMarketAsset === baseCurrency) {
        const maxSellQty = parseFloat(baseAssetBalance || "0");
        const qty = ((sellSliderValue / 100) * maxSellQty).toFixed(8);
        setSellMarketQty(qty);
      } else {
        const maxSellQty = parseFloat(baseAssetBalance) * currentPrice;
        const qty = ((sellSliderValue / 100) * maxSellQty).toFixed(8);
        setSellMarketQty(qty);
      }
    }
  }, [sellMarketAsset, sellSliderValue]);

  const buyTotal =
    buyPrice && buyQty
      ? (parseFloat(buyPrice) * parseFloat(buyQty)).toFixed(8)
      : "0";
  const sellTotal =
    sellPrice && sellQty
      ? (parseFloat(sellPrice) * parseFloat(sellQty)).toFixed(8)
      : "0";

  const handleBuyOrder = async () => {
    if (orderType === "limit") {
      if (!buyPrice || !buyQty) {
        toast.error("Vui lòng nhập giá và số lượng");
        return;
      }
    } else if (orderType === "market") {
      if (!buyMarketQty) {
        toast.error("Vui lòng nhập số lượng");
        return;
      }
    }

    try {
      setBuyLoading(true);

      const symbolCode = symbol?.code || pair.replace("_", "");
      const qty = orderType === "limit" ? buyQty : buyMarketQty;
      const orderData: {
        symbol: string;
        side: "BUY" | "SELL";
        type: "LIMIT" | "MARKET";
        qty?: string;
        price?: string;
        tif?: string;
        quote_order_qty?: string;
        slippage?: number;
        client_order_id: string;
      } = {
        symbol: symbolCode,
        side: "BUY",
        type: orderType === "limit" ? "LIMIT" : "MARKET",
        qty: qty,
        client_order_id: `buy_${Date.now()}`,
      };

      // Chỉ gửi price và tif cho limit order
      if (orderType === "limit") {
        orderData.price = buyPrice;
        orderData.tif = "GTC";
      }

      // Nếu market order, thêm quote_order_qty nếu chọn quote asset
      if (orderType === "market" && buyMarketAsset === quoteCurrency) {
        orderData.quote_order_qty = qty;
        delete orderData.qty;
      }

      console.log("Placing buy order:", orderData);
      await axiosInstance.post("/orders", orderData);

      toast.success(
        `Lệnh mua ${
          orderType === "limit" ? "giới hạn" : "thị trường"
        } thành công!`
      );
      setBuyPrice("");
      setBuyQty("");
      setBuyMarketQty("");
      setBuySliderValue(0);
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
    if (orderType === "limit") {
      if (!sellPrice || !sellQty) {
        toast.error("Vui lòng nhập giá và số lượng");
        return;
      }
    } else if (orderType === "market") {
      if (!sellMarketQty) {
        toast.error("Vui lòng nhập số lượng");
        return;
      }
    }

    try {
      setSellLoading(true);

      const symbolCode = symbol?.code || pair.replace("_", "");
      const qty = orderType === "limit" ? sellQty : sellMarketQty;
      const orderData: {
        symbol: string;
        side: "BUY" | "SELL";
        type: "LIMIT" | "MARKET";
        qty?: string;
        price?: string;
        tif?: string;
        quote_order_qty?: string;
        slippage?: number;
        client_order_id: string;
      } = {
        symbol: symbolCode,
        side: "SELL",
        type: orderType === "limit" ? "LIMIT" : "MARKET",
        qty: qty,
        client_order_id: `sell_${Date.now()}`,
      };

      // Chỉ gửi price và tif cho limit order
      if (orderType === "limit") {
        orderData.price = sellPrice;
        orderData.tif = "GTC";
      }

      // Nếu market order, thêm quote_order_qty nếu chọn quote asset
      if (orderType === "market" && sellMarketAsset === quoteCurrency) {
        orderData.quote_order_qty = qty;
        delete orderData.qty;
      }

      console.log("Placing sell order:", orderData);
      await axiosInstance.post("/orders", orderData);

      toast.success(
        `Lệnh bán ${
          orderType === "limit" ? "giới hạn" : "thị trường"
        } thành công!`
      );
      setSellPrice("");
      setSellQty("");
      setSellMarketQty("");
      setSellSliderValue(0);
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
            </div>

            {/* LIMIT ORDER TAB */}
            {orderType === "limit" && (
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

                  {/* Slider - BUY */}
                  <div className="px-1 py-2">
                    <InputRange
                      value={
                        buyQty && currentPrice
                          ? (parseFloat(buyQty) /
                              (parseFloat(quoteAssetBalance) / currentPrice)) *
                            100
                          : 0
                      }
                      onChange={(sliderValue) => {
                        const maxBuyQty =
                          parseFloat(quoteAssetBalance) / currentPrice;
                        const qty = ((sliderValue / 100) * maxBuyQty).toFixed(
                          8
                        );
                        setBuyQty(qty);
                      }}
                      max={100}
                    />
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

                  {/* Slider - SELL */}
                  <div className="px-1 py-2">
                    <InputRange
                      value={
                        sellQty && currentPrice
                          ? (parseFloat(sellQty) /
                              parseFloat(baseAssetBalance || "1")) *
                            100
                          : 0
                      }
                      onChange={(sliderValue) => {
                        const qty = (
                          (sliderValue / 100) *
                          parseFloat(baseAssetBalance || "0")
                        ).toFixed(8);
                        setSellQty(qty);
                      }}
                      max={100}
                    />
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
                          : (
                              parseFloat(baseAssetBalance) * currentPrice
                            ).toFixed(8)}{" "}
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
            )}

            {/* MARKET ORDER TAB */}
            {orderType === "market" && (
              <div className="flex-1 px-4 pb-3 grid grid-cols-2 gap-4 overflow-y-auto">
                {/* BUY FORM - Market */}

                <div className="space-y-3">
                  <NumberInput
                    label="Giá"
                    value=" "
                    onChange={() => {}}
                    unit="Giá thị trường"
                    showButtons={false}
                    rounded="rounded-md"
                    disabled={true}
                  />

                  <NumberInput
                    label="Số lượng"
                    value={buyMarketQty}
                    onChange={setBuyMarketQty}
                    unit={buyMarketAsset}
                    showButtons={true}
                    buttonType="selector"
                    assets={[quoteCurrency, baseCurrency]}
                    onAssetChange={setBuyMarketAsset}
                  />
                  {buyMarketAsset === baseCurrency && (
                    <div className="text-[10px] dark:text-gray-300 text-gray-500 italic mb-1  text-right">
                      Để tham khảo, có thể thay đổi tùy thuộc vào kết quả
                    </div>
                  )}
                  {/* Slider - MARKET BUY */}
                  <div className="px-1 py-2">
                    <InputRange
                      value={buySliderValue}
                      onChange={(sliderValue) => {
                        setBuySliderValue(sliderValue);
                        if (buyMarketAsset === quoteCurrency) {
                          const maxBuyQty = parseFloat(
                            quoteAssetBalance || "0"
                          );
                          const qty = ((sliderValue / 100) * maxBuyQty).toFixed(
                            8
                          );
                          setBuyMarketQty(qty);
                        } else {
                          const maxBuyQty =
                            parseFloat(quoteAssetBalance) / currentPrice;
                          const qty = ((sliderValue / 100) * maxBuyQty).toFixed(
                            8
                          );
                          setBuyMarketQty(qty);
                        }
                      }}
                      max={100}
                    />
                  </div>

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

                {/* SELL FORM - Market */}
                <div className="space-y-3">
                  <NumberInput
                    label="Giá"
                    value=" "
                    onChange={() => {}}
                    unit="Giá thị trường"
                    showButtons={false}
                    rounded="rounded-md"
                    disabled={true}
                  />

                  <NumberInput
                    label="Số lượng"
                    value={sellMarketQty}
                    onChange={setSellMarketQty}
                    unit={sellMarketAsset}
                    showButtons={true}
                    buttonType="selector"
                    assets={[baseCurrency, quoteCurrency]}
                    onAssetChange={setSellMarketAsset}
                  />

                  {/* Slider - MARKET SELL */}
                  <div className="px-1 py-2">
                    <InputRange
                      value={sellSliderValue}
                      onChange={(sliderValue) => {
                        setSellSliderValue(sliderValue);
                        if (sellMarketAsset === baseCurrency) {
                          const maxSellQty = parseFloat(
                            baseAssetBalance || "0"
                          );
                          const qty = (
                            (sliderValue / 100) *
                            maxSellQty
                          ).toFixed(8);
                          setSellMarketQty(qty);
                        } else {
                          const maxSellQty =
                            parseFloat(baseAssetBalance) * currentPrice;
                          const qty = (
                            (sliderValue / 100) *
                            maxSellQty
                          ).toFixed(8);
                          setSellMarketQty(qty);
                        }
                      }}
                      max={100}
                    />
                  </div>

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
                          : (
                              parseFloat(baseAssetBalance) * currentPrice
                            ).toFixed(8)}{" "}
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
            )}
          </div>
        )}
      </div>
    </>
  );
}
