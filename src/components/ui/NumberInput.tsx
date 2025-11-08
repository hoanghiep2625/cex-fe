import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  unit: string;
  readOnly?: boolean;
  showButtons?: boolean;
  buttonType?: "increment" | "selector"; // Loại button: tăng/giảm hoặc chọn asset
  onIncrement?: () => void;
  onDecrement?: () => void;
  onAssetChange?: (asset: string) => void; // Callback khi chọn asset
  assets?: string[]; // Danh sách assets để chọn (vd: ["BTC", "USDT"])
  rounded?: string;
  disabled?: boolean;
}

export default function NumberInput({
  label,
  value,
  onChange,
  placeholder = "0",
  unit,
  readOnly = false,
  showButtons = true,
  buttonType = "increment",
  onIncrement,
  onDecrement,
  onAssetChange,
  assets = [],
  rounded = "rounded-md rounded-r-none",
  disabled = false,
}: NumberInputProps) {
  return (
    <div className="flex">
      <div
        className={`border dark:border-gray-700 ${rounded} border-gray-300 w-full p-2 flex justify-between items-center ${
          disabled ? "dark:bg-gray-800 bg-gray-100" : ""
        }`}
      >
        <div className="text-xs text-gray-400 font-semibold">{label}</div>
        <div className="flex items-center gap-1 flex-1 justify-end">
          <div className="flex-1">
            <input
              type="text"
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              readOnly={readOnly}
              className={`w-full outline-none text-sm text-right items-center flex font-semibold bg-transparent placeholder-gray-600 ${
                disabled
                  ? "dark:text-gray-500 text-gray-400 cursor-not-allowed"
                  : "dark:text-white text-black"
              }`}
            />
          </div>
          <div
            className={`text-sm font-semibold ${
              disabled
                ? "dark:text-gray-500 text-gray-400"
                : "dark:text-white text-black"
            }`}
          >
            {unit}
          </div>
        </div>
      </div>
      {showButtons && buttonType === "increment" && (
        <div className="flex flex-col items-center justify-center w-6 gap-0.5 border border-l-0 dark:border-gray-700 border-gray-300 rounded-r-md">
          <button
            onClick={onIncrement}
            disabled={disabled}
            className="text-[8px] text-gray-400 dark:hover:text-white hover:text-gray-500 leading-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoMdArrowDropup className="w-4 h-4" />
          </button>
          <hr className="w-full dark:border-gray-700 border-gray-300" />
          <button
            onClick={onDecrement}
            disabled={disabled}
            className="text-[8px] text-gray-400 dark:hover:text-white hover:text-gray-500 leading-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoMdArrowDropdown className="w-4 h-4" />
          </button>
        </div>
      )}
      {showButtons && buttonType === "selector" && (
        <div className="relative">
          <select
            value={unit}
            onChange={(e) => onAssetChange?.(e.target.value)}
            disabled={disabled}
            className="h-full px-3 border border-l-0 dark:border-gray-700 border-gray-300 rounded-r-md dark:bg-[#181A20] bg-white dark:text-white text-black text-sm font-semibold outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8"
          >
            {assets.map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
          <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none dark:text-white text-black" />
        </div>
      )}
    </div>
  );
}
