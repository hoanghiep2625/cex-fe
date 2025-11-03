"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
} from "lightweight-charts";
import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
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
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const hasInitialFit = useRef(false); // Track if we've done initial fitContent

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
      upColor: "#2dbd86",
      downColor: "#f5475e",
      borderVisible: false,
      wickUpColor: "#2dbd86",
      wickDownColor: "#f5475e",
    });

    // Set price scale for candlestick - takes top 70%
    candlestickSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: 0.2, // Leave space for volume
      },
    });

    // Add volume series on same chart
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume", // Create separate scale for volume with ID
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Configure volume price scale on right side
    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
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

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
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
      timeScale: {
        borderColor: isDark ? "#2A2E39" : "#E5E7EB",
      },
      rightPriceScale: {
        borderColor: isDark ? "#2A2E39" : "#E5E7EB",
      },
    });
  }, [isDark]);

  useEffect(() => {
    if (
      !candlestickSeriesRef.current ||
      !volumeSeriesRef.current ||
      candles.length === 0
    )
      return;

    const candleData: CandlestickData[] = candles.map((candle) => ({
      time: Math.floor(candle.open_time / 1000) as CandlestickData["time"], // Convert ms to seconds
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
    }));

    const volumeData: HistogramData[] = candles.map((candle) => {
      const open = parseFloat(candle.open);
      const close = parseFloat(candle.close);
      return {
        time: Math.floor(candle.open_time / 1000) as HistogramData["time"],
        value: parseFloat(candle.volume),
        color:
          close >= open ? "rgba(45, 189, 134, 0.5)" : "rgba(245, 71, 94, 0.5)",
      };
    });

    candlestickSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    if (chartRef.current && !hasInitialFit.current) {
      chartRef.current.timeScale().fitContent();
      hasInitialFit.current = true;
    }
  }, [candles]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
