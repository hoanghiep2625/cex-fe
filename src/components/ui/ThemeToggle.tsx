"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { LuMoon, LuSunMedium } from "react-icons/lu";

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Chỉ render icon sau khi đã vào client
  }, []);

  if (!mounted) return null; // Ngăn nhấp nháy icon sai ban đầu

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`text-white hover:text-yellow-400 dark:hover:text-yellow-300 transition ${className}`}
    >
      {theme === "dark" ? (
        <LuSunMedium className="text-white w-6 h-6 font-semibold" />
      ) : (
        <LuMoon className="text-black w-6 h-6 font-semibold" />
      )}
    </button>
  );
}
