"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, ColorType } from "lightweight-charts";
import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
} from "lightweight-charts";
import { Candle } from "@/hooks/useCandles";

interface CandlestickChartProps {
  candles: Candle[];
  isDark: boolean;
}

export default function CandlestickChart({
  candles,
  isDark,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const hasInitialFit = useRef(false); // Track if we've done initial fitContent

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart (v5 API - theo docs example)
    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: isDark ? "#9CA3AF" : "#6B7280",
        background: {
          type: ColorType.Solid,
          color: isDark ? "#181A20" : "#ffffff",
        },
      },
      grid: {
        vertLines: { color: isDark ? "#2A2E39" : "#E5E7EB" },
        horzLines: { color: isDark ? "#2A2E39" : "#E5E7EB" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: isDark ? "#2A2E39" : "#E5E7EB",
      },
      rightPriceScale: {
        borderColor: isDark ? "#2A2E39" : "#E5E7EB",
      },
    });

    // Add candlestick series (v5 API - theo docs example)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22C55E",
      downColor: "#EF4444",
      borderVisible: false,
      wickUpColor: "#22C55E",
      wickDownColor: "#EF4444",
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    hasInitialFit.current = false; // Reset fit flag when chart is recreated

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [isDark]);

  // Update candle data
  useEffect(() => {
    if (!candlestickSeriesRef.current || candles.length === 0) return;

    const data: CandlestickData[] = candles.map((candle) => ({
      time: (candle.open_time / 1000) as any, // Convert to seconds
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
    }));

    candlestickSeriesRef.current.setData(data);

    // Only fitContent on initial load, not on updates (to preserve zoom/pan)
    if (chartRef.current && !hasInitialFit.current) {
      chartRef.current.timeScale().fitContent();
      hasInitialFit.current = true;
    }
  }, [candles]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
