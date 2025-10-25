import { ReactNode } from "react";

interface TabUnderlineProps {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

export default function TabUnderline({
  active,
  children,
  onClick,
  className = "",
}: TabUnderlineProps) {
  return (
    <div className="relative inline-flex">
      <button
        onClick={onClick}
        className={`${
          active
            ? "dark:text-white text-black"
            : "text-gray-400 dark:hover:text-white hover:text-black"
        } ${className}`}
      >
        {children}
      </button>
      {active && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[3px] bg-yellow-400" />
      )}
    </div>
  );
}
