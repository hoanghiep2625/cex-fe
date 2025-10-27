"use client";

import TabUnderline from "@/components/ui/TabUnderline";
import { useRef, useState, useEffect } from "react";

interface TradingViewWindow extends Window {
  TradingView?: {
    widget: new (config: Record<string, unknown>) => void;
  };
}

export default function ChartPanel({ pair }: { pair: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "info" | "trades">(
    "chart"
  );
  const [chartType, setChartType] = useState<"goc" | "tradingview" | "chitiet">(
    "tradingview"
  );
  const [timeframe, setTimeframe] = useState("D");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Detect dark mode
  useEffect(() => {
    const darkMode = document.documentElement.classList.contains("dark");
    setIsDark(darkMode);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Load TradingView Script
  useEffect(() => {
    if (chartType === "tradingview" && !scriptLoaded) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);

      if (
        !document.querySelector(
          'script[src="https://s3.tradingview.com/tv.js"]'
        )
      ) {
        document.body.appendChild(script);
      } else {
        setScriptLoaded(true);
      }
    }
  }, [chartType, scriptLoaded]);

  // Initialize TradingView Widget
  useEffect(() => {
    if (
      chartType === "tradingview" &&
      scriptLoaded &&
      chartContainerRef.current
    ) {
      const win = window as TradingViewWindow;
      chartContainerRef.current.innerHTML = "";

      if (win.TradingView) {
        new win.TradingView.widget({
          autosize: true,
          symbol: pair.replace("_", ""),
          interval: timeframe,
          timezone: "Etc/UTC",
          theme: isDark ? "dark" : "light",
          style: "1",
          locale: "vi",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview-chart",
          hide_side_toolbar: false,
          hide_top_toolbar: true,
          withdateranges: false,
          hide_legend: false,
          save_image: false,
          studies_overrides: {},
          overrides: {},
          toolbar_bg: isDark ? "#181A20" : "#ffffff",
          disabled_features: [
            "header_widget",
            "timeframes_toolbar",
            "header_chart_type",
            "header_indicators",
          ],
        });
      }
    }
  }, [chartType, timeframe, scriptLoaded, isDark, pair]);

  // Chart UI component
  return (
    <div className="flex-2 dark:bg-[#181A20] bg-white rounded-[10px] flex flex-col">
      <div className="dark:bg-[#181A20] bg-white h-[45px] rounded-t-[10px] border-b dark:border-b-gray-700 border-b-gray-300 px-4 flex items-center gap-6">
        <TabUnderline
          className="text-[13px] font-semibold pb-3 pt-3"
          active={activeTab === "chart"}
          onClick={() => setActiveTab("chart")}
        >
          Đồ thị
        </TabUnderline>
        <TabUnderline
          className="text-[13px] font-semibold pb-3 pt-3"
          active={activeTab === "info"}
          onClick={() => setActiveTab("info")}
        >
          Thông tin
        </TabUnderline>
        <TabUnderline
          className="text-[13px] font-semibold pb-3 pt-3"
          active={activeTab === "trades"}
          onClick={() => setActiveTab("trades")}
        >
          Dữ liệu giao dịch
        </TabUnderline>
      </div>
      {activeTab === "chart" && (
        <div className="dark:bg-[#181A20] bg-white flex-1 rounded-b-[10px] flex flex-col">
          <div className="dark:bg-[#181A20] bg-white flex justify-between p-2 ">
            <ul className="flex text-[12px] gap-2 text-gray-400 font-semibold">
              <li className="dark:text-gray-400 text-gray-600">Thời gian</li>
              <li
                className={
                  timeframe === "1"
                    ? "dark:text-white text-black cursor-pointer"
                    : "dark:text-gray-400 text-gray-600 cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setTimeframe("1")}
              >
                1s
              </li>
              <li
                className={
                  timeframe === "15"
                    ? "dark:text-white text-black cursor-pointer"
                    : "dark:text-gray-400 text-gray-600 cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setTimeframe("15")}
              >
                15Phút
              </li>
              <li
                className={
                  timeframe === "60"
                    ? "dark:text-white text-black cursor-pointer"
                    : "dark:text-gray-400 text-gray-600 cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setTimeframe("60")}
              >
                1h
              </li>
              <li
                className={
                  timeframe === "240"
                    ? "dark:text-white text-black cursor-pointer"
                    : "dark:text-gray-400 text-gray-600 cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setTimeframe("240")}
              >
                4h
              </li>
              <li
                className={
                  timeframe === "D"
                    ? "dark:text-white text-black cursor-pointer"
                    : "dark:text-gray-400 text-gray-600 cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setTimeframe("D")}
              >
                1Ngày
              </li>
              <li
                className={
                  timeframe === "W"
                    ? "dark:text-white text-black cursor-pointer"
                    : "dark:text-gray-400 text-gray-600 cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setTimeframe("W")}
              >
                1Tuần
              </li>
            </ul>
            <ul className="flex text-[12px] gap-2 font-semibold dark:text-gray-400 text-gray-600">
              <li
                className={
                  chartType === "goc"
                    ? "dark:text-white text-black cursor-pointer"
                    : "cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setChartType("goc")}
              >
                Gốc
              </li>
              <li
                className={
                  chartType === "tradingview"
                    ? "dark:text-white text-black cursor-pointer"
                    : "cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setChartType("tradingview")}
              >
                Trading view
              </li>
              <li
                className={
                  chartType === "chitiet"
                    ? "dark:text-white text-black cursor-pointer"
                    : "cursor-pointer hover:dark:text-gray-200 hover:text-gray-800"
                }
                onClick={() => setChartType("chitiet")}
              >
                Chi tiết
              </li>
            </ul>
          </div>
          <div className="flex-1 rounded-b-[10px] overflow-hidden">
            {chartType === "goc" && (
              <div className="w-full h-full flex items-center justify-center dark:text-gray-400 text-gray-600 text-lg">
                Biểu đồ gốc (demo)
              </div>
            )}
            {chartType === "chitiet" && (
              <div className="w-full h-full flex items-center justify-center dark:text-gray-400 text-gray-600 text-lg">
                Biểu đồ chi tiết (demo)
              </div>
            )}
            {chartType === "tradingview" && (
              <div
                ref={chartContainerRef}
                id="tradingview-chart"
                className="w-full h-full min-h-[400px]"
              />
            )}
          </div>
        </div>
      )}
      {activeTab === "info" && (
        <div className="dark:bg-[#1f2937] bg-gray-100 flex-1 rounded-b-[10px] dark:text-white text-black">
          Info content
        </div>
      )}
      {activeTab === "trades" && (
        <div className="dark:bg-[#1f2937] bg-gray-100 flex-1 rounded-b-[10px] dark:text-white text-black">
          Trades content
        </div>
      )}
    </div>
  );
}
