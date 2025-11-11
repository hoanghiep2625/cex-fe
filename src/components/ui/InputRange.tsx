"use client";

import { useState, useRef, useEffect } from "react";

interface InputRangeProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  min?: number;
  disabled?: boolean;
}

export default function InputRange({
  value: externalValue = 0,
  onChange: onExternalChange,
  max = 100,
  min = 0,
  disabled = false,
}: InputRangeProps) {
  const [value, setValue] = useState(externalValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    setValue(externalValue);
  }, [externalValue]);

  const handleMouseDown = () => {
    if (!disabled) {
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(min, Math.min(max, (x / rect.width) * max));
      const newValue = Math.round(percentage);
      setValue(newValue);
      onExternalChange?.(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, max, min, onExternalChange]);

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Track */}
      <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-px bg-gray-300 dark:bg-gray-700 rounded-sm z-0"></div>

      {/* Progress */}
      <div
        className="absolute top-1/2 transform -translate-y-1/2 h-px bg-black dark:bg-white rounded-sm z-0"
        style={{ width: `${value}%` }}
      ></div>

      {/* Marks (5 hình vuông nhỏ) - tượng trưng cho 0%, 25%, 50%, 75%, 100% */}
      <div className="flex justify-between absolute top-1/2 transform -translate-y-1/2 w-full pointer-events-none z-10">
        {[0, 25, 50, 75, 100].map((markPercent) => {
          const markValue = (markPercent / 100) * max;
          return (
            <div
              key={markPercent}
              className={`w-1.5 h-1.5 transform rotate-45 transition-colors ${
                value >= markValue
                  ? "bg-black dark:bg-white border border-black dark:border-white"
                  : "border border-gray-400 dark:border-gray-700 bg-white dark:bg-[#181A20]"
              }`}
            ></div>
          );
        })}
      </div>

      {/* Thumb (nút trượt) - có thể thay hình ảnh ở đây */}
      <div
        className={`absolute top-0 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#181A20] border-[1.5px] border-black dark:border-white z-30 select-none rotate-45 ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-grab active:cursor-grabbing"
        }`}
        style={{ left: `${value}%` }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => !disabled && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      ></div>

      {/* Percentage display */}
      {(isDragging || isHovering) && (
        <div
          className="absolute -top-8 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold px-1 py-0.5 rounded whitespace-nowrap z-40"
          style={{ left: `${value}%` }}
        >
          {Math.round(value)}%
        </div>
      )}
    </div>
  );
}
