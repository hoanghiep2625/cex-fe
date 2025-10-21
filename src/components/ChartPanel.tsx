"use client";

import { useRef, useState, useEffect } from "react";

export default function ChartPanel() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "info" | "trades">(
    "chart"
  );
  const [chartType, setChartType] = useState<"goc" | "tradingview" | "chitiet">(
    "goc"
  );
  const [timeframe, setTimeframe] = useState("D");
  const [scriptLoaded, setScriptLoaded] = useState(false);

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
      const win = window as any;
      chartContainerRef.current.innerHTML = "";

      if (win.TradingView) {
        new win.TradingView.widget({
          autosize: true,
          symbol: "BTCUSD",
          interval: timeframe,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
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
          toolbar_bg: "#181A20",
          disabled_features: [
            "header_widget",
            "timeframes_toolbar",
            "header_chart_type",
            "header_indicators",
          ],
        });
      }
    }
  }, [chartType, timeframe, scriptLoaded]);

  // Chart UI component
  return (
    <div className="flex-2 bg-[#181A20] rounded-[10px] flex flex-col">
      <div className="bg-[#181A20] h-[50px] rounded-t-[10px] border-b border-b-gray-700 px-4 flex items-end">
        <button
          onClick={() => setActiveTab("chart")}
          className="relative mr-8 text-[13px] font-semibold pb-3 cursor-pointer transition-colors duration-200 group"
        >
          <span
            className={activeTab === "chart" ? "text-white" : "text-gray-400"}
          >
            Đồ thị
          </span>
          {activeTab === "chart" && (
            <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-yellow-400 w-fit" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className="relative mr-8 text-[13px] font-semibold pb-3 cursor-pointer transition-colors duration-200 group"
        >
          <span
            className={activeTab === "info" ? "text-white" : "text-gray-400"}
          >
            Thông tin
          </span>
          {activeTab === "info" && (
            <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-yellow-400 w-fit" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("trades")}
          className="relative text-[13px] font-semibold pb-3 cursor-pointer transition-colors duration-200 group"
        >
          <span
            className={activeTab === "trades" ? "text-white" : "text-gray-400"}
          >
            Dữ liệu giao dịch
          </span>
          {activeTab === "trades" && (
            <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-yellow-400 w-fit" />
          )}
        </button>
      </div>
      {activeTab === "chart" && (
        <div className="bg-[#181A20] flex-1 rounded-b-[10px] flex flex-col">
          <div className="bg-[#181A20] flex justify-between p-2 border border-b-gray-700">
            <ul className="flex text-[12px] gap-2 text-gray-400 font-semibold">
              <li>Thời gian</li>
              <li
                className={timeframe === "1" ? "text-white" : "cursor-pointer"}
                onClick={() => setTimeframe("1")}
              >
                1s
              </li>
              <li
                className={timeframe === "15" ? "text-white" : "cursor-pointer"}
                onClick={() => setTimeframe("15")}
              >
                15Phút
              </li>
              <li
                className={timeframe === "60" ? "text-white" : "cursor-pointer"}
                onClick={() => setTimeframe("60")}
              >
                1h
              </li>
              <li
                className={
                  timeframe === "240" ? "text-white" : "cursor-pointer"
                }
                onClick={() => setTimeframe("240")}
              >
                4h
              </li>
              <li
                className={timeframe === "D" ? "text-white" : "cursor-pointer"}
                onClick={() => setTimeframe("D")}
              >
                1Ngày
              </li>
              <li
                className={timeframe === "W" ? "text-white" : "cursor-pointer"}
                onClick={() => setTimeframe("W")}
              >
                1Tuần
              </li>
            </ul>
            <ul className="flex text-[12px] gap-2 font-semibold text-gray-400">
              <li
                className={
                  chartType === "goc" ? "text-white" : "cursor-pointer"
                }
                onClick={() => setChartType("goc")}
              >
                Gốc
              </li>
              <li
                className={
                  chartType === "tradingview" ? "text-white" : "cursor-pointer"
                }
                onClick={() => setChartType("tradingview")}
              >
                Trading view
              </li>
              <li
                className={
                  chartType === "chitiet" ? "text-white" : "cursor-pointer"
                }
                onClick={() => setChartType("chitiet")}
              >
                Chi tiết
              </li>
            </ul>
          </div>
          <div className="flex-1 rounded-b-[10px] overflow-hidden">
            {chartType === "goc" && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                Biểu đồ gốc (demo)
              </div>
            )}
            {chartType === "chitiet" && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
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
        <div className="bg-emerald-700 flex-1 rounded-b-[10px]">12</div>
      )}
      {activeTab === "trades" && (
        <div className="bg-emerald-900 flex-1 rounded-b-[10px]">13</div>
      )}
    </div>
  );
}
