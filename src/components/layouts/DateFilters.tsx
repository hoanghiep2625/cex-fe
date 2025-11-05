"use client";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";

interface DateFiltersProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export default function DateFilters({ onDateRangeChange }: DateFiltersProps) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateFilter, setDateFilter] = useState("1 ngày");
  const [startDate, setStartDate] = useState(
    yesterday.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const handleDateFilterClick = (filter: string) => {
    setDateFilter(filter);

    const now = new Date();
    const start = new Date();

    switch (filter) {
      case "1 ngày":
        start.setDate(now.getDate() - 1);
        break;
      case "1 Tuần":
        start.setDate(now.getDate() - 7);
        break;
      case "1 Tháng":
        start.setMonth(now.getMonth() - 1);
        break;
      case "3 Tháng":
        start.setMonth(now.getMonth() - 3);
        break;
      case "Thời gian":
        // Không tự động log, đợi user chọn và click "Tìm"
        return;
    }

    const startStr = start.toISOString().split("T")[0];
    const endStr = now.toISOString().split("T")[0];

    setStartDate(startStr);
    setEndDate(endStr);

    if (onDateRangeChange) {
      onDateRangeChange(startStr, endStr);
    }
  };

  const handleSearch = () => {
    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleReset = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const todayStr = now.toISOString().split("T")[0];

    setStartDate(yesterdayStr);
    setEndDate(todayStr);
    setDateFilter("1 ngày");

    if (onDateRangeChange) {
      onDateRangeChange(yesterdayStr, todayStr);
    }
  };

  return (
    <div className="flex items-center pb-2 dark:border-[#373c43] flex-wrap">
      {["1 ngày", "1 Tuần", "1 Tháng", "3 Tháng"].map((filter) => (
        <button
          key={filter}
          onClick={() => handleDateFilterClick(filter)}
          className={`px-2 py-1 text-[12px] font-semibold rounded-sm text-[#9c9c9c] cursor-pointer ${
            dateFilter === filter ? "bg-[#29313D] text-white" : ""
          }`}
        >
          {filter}
        </button>
      ))}
      <div className="border-l px-2 text-[12px] font-semibold text-[#9c9c9c]">
        thời gian
      </div>
      <div className="flex hover:border-amber-300 border border-transparent justify-center items-center gap-2 mx-2 rounded-sm bg-transparent">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="cursor-pointer px-3 py-1 text-[12px] w-[120px] rounded-sm font-semibold text-white focus:outline-none"
        />
        <span className="text-[#9c9c9c]">
          <FaArrowRight width={2} height={2} />
        </span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="cursor-pointer px-3 py-1 text-[12px] w-[120px] rounded-sm font-semibold text-white focus:outline-none"
        />
      </div>

      <button
        onClick={handleSearch}
        className="px-3 py-1 text-[12px] text-white bg-[#29313D] rounded-sm font-semibold cursor-pointer"
      >
        Tìm
      </button>
      <button
        onClick={handleReset}
        className="px-3 py-1 text-[12px] text-white font-semibold rounded-sm cursor-pointer"
      >
        Đặt lại
      </button>
    </div>
  );
}
