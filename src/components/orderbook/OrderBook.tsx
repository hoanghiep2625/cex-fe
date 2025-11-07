"use client";

import { useState, useMemo } from "react";
import { useSymbol } from "@/context/SymbolContext";
import axiosInstance from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Symbol } from "@/types";
import { FaArrowUpLong, FaArrowDownLong } from "react-icons/fa6";
import { PiApproximateEqualsBold } from "react-icons/pi";
import { LuChevronRight } from "react-icons/lu";
import { fmt, formatQty } from "@/lib/formatters";
import { useOrderBook, useRecentTrades, useMarketData } from "@/hooks";

interface OrderBookLevel {
  price: number | string;
  quantity: number | string;
  total: number | string;
  percentage: number | string;
  cumulativeAvgPrice?: number;
  cumulativeTotalQty?: number;
  cumulativeTotalValue?: number;
}

interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

interface TradeData {
  id: string;
  price: string;
  quantity: string;
  time: number;
  takerSide: "BUY" | "SELL";
}

export default function OrderBook({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [grouping, setGrouping] = useState("0.01");
  const [hoveredAskIndex, setHoveredAskIndex] = useState<number | null>(null);
  const [hoveredBidIndex, setHoveredBidIndex] = useState<number | null>(null);
  const { symbol } = useSymbol();
  const symbolCode = symbol?.code || pair.replace("_", "");

  const { data: initialOrderBook, isLoading: orderBookLoading } =
    useQuery<OrderBookData>({
      queryKey: ["orderbook", symbolCode],
      queryFn: () =>
        axiosInstance
          .get(`/orderbook/${symbolCode}/depth`, { params: { limit: 19 } })
          .then((r) => r.data?.data),
      refetchOnWindowFocus: false,
    });

  // Subscribe to WebSocket updates
  const { orderBook: wsOrderBook } = useOrderBook(symbolCode, type || "spot");

  // Use WebSocket update if available, otherwise use initial data from REST API
  const orderBook = useMemo(() => {
    return (wsOrderBook as OrderBookData | null) || initialOrderBook || null;
  }, [wsOrderBook, initialOrderBook]);

  const { trades: rawTrades } = useRecentTrades(
    symbol?.code || pair.replace("_", "")
  );
  const trades = (rawTrades as TradeData[]) || [];

  // Fetch initial market data from REST API
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

  // Subscribe to WebSocket updates for market data
  const { marketData: wsMarketData } = useMarketData(
    symbolCode,
    type || "spot"
  );

  // Get current price from market data
  const marketData = useMemo(() => {
    return (
      (wsMarketData as { price?: number; currentPrice?: number } | null) ||
      (initialMarketData as { price?: number; currentPrice?: number } | null) ||
      null
    );
  }, [wsMarketData, initialMarketData]);

  const currentPrice = marketData?.currentPrice || marketData?.price || 0;

  const { data } = useQuery<Symbol>({
    queryKey: ["symbolInfo", symbol?.code || pair.replace("_", "")],
    queryFn: () =>
      axiosInstance
        .get(`/symbols/code/${symbol?.code || pair.replace("_", "")}`)
        .then((r) => r.data?.data ?? r.data ?? []),
  });

  const { asks = [], bids = [] } = orderBook || {};
  const totalBids = bids.reduce(
    (s, b) =>
      s +
      (typeof b.quantity === "string" ? parseFloat(b.quantity) : b.quantity),
    0
  );
  const totalAsks = asks.reduce(
    (s, a) =>
      s +
      (typeof a.quantity === "string" ? parseFloat(a.quantity) : a.quantity),
    0
  );
  const buyPct = (totalBids / (totalBids + totalAsks)) * 100 || 0;

  interface Level {
    price: number | string;
    quantity: number | string;
    total: number | string;
    percentage: number | string;
    cumulativeAvgPrice?: number;
    cumulativeTotalQty?: number;
    cumulativeTotalValue?: number;
  }

  const Row = ({
    level,
    isAsk,
    index,
    isHighlighted,
    isDirectHover,
  }: {
    level: Level;
    isAsk?: boolean;
    index: number;
    isHighlighted: boolean;
    isDirectHover: boolean;
  }) => {
    // Sử dụng dữ liệu cumulative từ backend
    const groupStats = useMemo(() => {
      if (!isDirectHover || !level.cumulativeAvgPrice) {
        return { avgPrice: 0, totalQuantity: 0, totalValue: 0 };
      }

      return {
        avgPrice: level.cumulativeAvgPrice || 0,
        totalQuantity: level.cumulativeTotalQty || 0,
        totalValue: level.cumulativeTotalValue || 0,
      };
    }, [
      isDirectHover,
      level.cumulativeAvgPrice,
      level.cumulativeTotalQty,
      level.cumulativeTotalValue,
    ]);

    return (
      <div
        onMouseEnter={() => {
          if (isAsk) {
            setHoveredAskIndex(index);
            setHoveredBidIndex(null);
          } else {
            setHoveredBidIndex(index);
            setHoveredAskIndex(null);
          }
        }}
        onMouseLeave={() =>
          isAsk ? setHoveredAskIndex(null) : setHoveredBidIndex(null)
        }
        className={`group px-4 py-0.5 grid grid-cols-3 gap-4 cursor-pointer relative text-xs ${
          isHighlighted ? "dark:bg-gray-800/50 bg-gray-100/50" : ""
        } ${
          isDirectHover
            ? isAsk
              ? "border-t border-dashed border-gray-400 dark:border-gray-500"
              : "border-b border-dashed border-gray-400 dark:border-gray-500"
            : ""
        }`}
      >
        {/* Background bars for each column */}
        <div
          className={`absolute inset-y-0 right-0 ${
            isAsk
              ? "bg-[#FBE9EB] dark:bg-[#2F1E26]"
              : "bg-[#EAF8F2] dark:bg-[#1B2A2A]"
          }`}
          style={{ width: `${level.percentage}%` }}
        />

        <span
          className={`relative z-10 ${
            isAsk ? "text-red-400" : "text-green-400"
          } ${isDirectHover ? "font-semibold" : ""}`}
        >
          {fmt(level.price)}
        </span>
        <span
          className={`dark:text-white text-black text-right relative z-10 ${
            isDirectHover ? "font-semibold" : "font-medium"
          }`}
        >
          {formatQty(level.quantity, 5)}
        </span>
        <span
          className={`dark:text-white text-black text-right relative z-10 ${
            isDirectHover ? "font-semibold" : "font-medium"
          }`}
        >
          {formatQty(level.total, 2)}
        </span>
        {isDirectHover && (
          <div className="group-hover:block hidden absolute -top-6 -right-[193px] z-2 dark:bg-gray-200 bg-black dark:text-black text-white p-2 rounded shadow-lg border border-gray-300">
            {/* Mũi tên trỏ vào row */}
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] dark:border-r-gray-300 border-black"></div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] dark:border-r-gray-200 border-black"></div>
            <div className="flex gap-2 text-xs">
              <div>
                <p>Giá trung bình:</p>
                <p>Tổng ({data?.base_asset}):</p>
                <p>Tổng ({data?.quote_asset}):</p>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1">
                  <PiApproximateEqualsBold />
                  {fmt(groupStats.avgPrice)}
                </p>
                <p>{formatQty(groupStats.totalQuantity, 5)}</p>
                <p>{formatQty(groupStats.totalValue, 2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[30%] dark:bg-[#181A20] bg-white rounded-[10px] text-white flex flex-col relative overflow-visible">
      <div className="px-4 py-3 border-b dark:border-gray-700 border-gray-300 flex justify-between">
        <span className="text-sm font-semibold dark:text-white text-black">
          Sổ lệnh
        </span>
        <select
          value={grouping}
          onChange={(e) => setGrouping(e.target.value)}
          className="bg-transparent text-xs dark:text-white text-black cursor-pointer"
        >
          <option value="0.01">0.01</option>
          <option value="0.1">0.1</option>
          <option value="1">1</option>
          <option value="10">10</option>
        </select>
      </div>

      <div className="px-4 py-2 text-[10px] text-gray-500 font-semibold grid grid-cols-3 gap-4">
        <span>Giá ({data?.quote_asset})</span>
        <span className="text-right">Số lượng ({data?.base_asset})</span>
        <span className="text-right">Tổng</span>
      </div>

      <div className="flex-1 flex flex-col dark:text-white text-black relative">
        <div className="flex-1 flex flex-col-reverse font-medium">
          {asks.map((a, i) => {
            const isHighlighted =
              hoveredAskIndex !== null && i <= hoveredAskIndex;
            const isDirectHover = hoveredAskIndex === i;
            return (
              <Row
                key={`ask-${a.price}-${a.quantity}-${i}`}
                level={a}
                isAsk
                index={i}
                isHighlighted={isHighlighted}
                isDirectHover={isDirectHover}
              />
            );
          })}
        </div>

        {/* Current Price - CENTER */}
        <div className="px-4 py-3 flex justify-between items-center gap-2 z-10 dark:bg-[#181A20] bg-white">
          <div>
            <span
              className={`text-lg font-semibold flex items-center  ${
                trades[0]?.takerSide === "BUY"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {fmt(currentPrice)}
              {trades[0]?.takerSide === "BUY" ? (
                <FaArrowUpLong className="text-green-400 text-sm" />
              ) : (
                <FaArrowDownLong className="text-red-400 text-sm" />
              )}
              <span className="text-gray-400 text-xs font-semibold">
                {" "}
                {"$"}
                {fmt(currentPrice)}
              </span>
            </span>
          </div>

          <LuChevronRight className="text-gray-400 hover:text-black dark:hover:text-white" />
        </div>

        {/* BIDS - No scroll */}
        <div className="flex-1 font-medium">
          {bids.map((b, i) => {
            // Highlight từ row 0 (gần CENTER nhất) đến row được hover
            const isHighlighted =
              hoveredBidIndex !== null && i <= hoveredBidIndex;
            const isDirectHover = hoveredBidIndex === i;
            return (
              <Row
                key={`bid-${b.price}-${b.quantity}-${i}`}
                level={b}
                index={i}
                isHighlighted={isHighlighted}
                isDirectHover={isDirectHover}
              />
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="dark:text-white text-black">
            B <span className="text-green-400">{buyPct.toFixed(1)}%</span>
          </span>
          <div className="flex-1 flex h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="bg-green-400" style={{ width: `${buyPct}%` }} />
            <div className="bg-red-400" style={{ width: `${100 - buyPct}%` }} />
          </div>
          <span className="dark:text-white text-black">
            <span className="text-red-400">{(100 - buyPct).toFixed(1)}%</span> S
          </span>
        </div>
      </div>
    </div>
  );
}
