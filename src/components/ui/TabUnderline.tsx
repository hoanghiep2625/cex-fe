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
          active ? "text-white" : "text-gray-400 hover:text-gray-300"
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
