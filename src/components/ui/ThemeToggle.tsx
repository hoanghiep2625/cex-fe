"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, SunMedium } from "lucide-react";

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
        <SunMedium width={28} height={28} strokeWidth={1.7} />
      ) : (
        <Moon width={24} height={24} strokeWidth={1.7} className="text-black" />
      )}
    </button>
  );
}
