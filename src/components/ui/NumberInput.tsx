import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  unit: string;
  readOnly?: boolean;
  showButtons?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  rounded?: string;
}

export default function NumberInput({
  label,
  value,
  onChange,
  placeholder = "0",
  unit,
  readOnly = false,
  showButtons = true,
  onIncrement,
  onDecrement,
  rounded = "rounded-md rounded-r-none",
}: NumberInputProps) {
  return (
    <div className="flex">
      <div
        className={`border dark:border-gray-700 ${rounded} border-gray-300 w-full p-2 flex justify-between items-center`}
      >
        <div className="text-xs text-gray-400 font-semibold">{label}</div>
        <div className="flex items-center gap-1 flex-1 justify-end">
          <div className="flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              readOnly={readOnly}
              className="w-full outline-none text-sm text-right items-center flex dark:text-white text-black font-semibold bg-transparent placeholder-gray-600"
            />
          </div>
          <div className="text-sm dark:text-white text-black font-semibold">
            {unit}
          </div>
        </div>
      </div>
      {showButtons && (
        <div className="flex flex-col items-center justify-center w-6 gap-0.5 border border-l-0 dark:border-gray-700 border-gray-300 rounded-r-md">
          <button
            onClick={onIncrement}
            className="text-[8px] text-gray-400 dark:hover:text-white hover:text-gray-500 leading-none"
          >
            <IoMdArrowDropup className="w-4 h-4" />
          </button>
          <hr className="w-full dark:border-gray-700 border-gray-300" />
          <button
            onClick={onDecrement}
            className="text-[8px] text-gray-400 dark:hover:text-white hover:text-gray-500 leading-none"
          >
            <IoMdArrowDropdown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
