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
}: NumberInputProps) {
  return (
    <div className="flex">
      <div className="border border-gray-700 rounded-md rounded-r-none w-full p-2 flex justify-between items-center">
        <div className="text-xs text-gray-400 font-semibold">{label}</div>
        <div className="flex items-center gap-1 flex-1 justify-end">
          <div className="flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              readOnly={readOnly}
              className="w-full outline-none text-sm text-right items-center flex text-white font-semibold bg-transparent placeholder-gray-600"
            />
          </div>
          <div className="text-sm text-white font-semibold">{unit}</div>
        </div>
      </div>
      {showButtons && (
        <div className="flex flex-col items-center justify-center w-6 gap-1 border border-l-0 border-gray-700 rounded-r-md">
          <button
            onClick={onIncrement}
            className="text-[8px] text-gray-400 hover:text-white leading-none"
          >
            ▲
          </button>
          <hr className="w-full border-gray-700" />
          <button
            onClick={onDecrement}
            className="text-[8px] text-gray-400 hover:text-white leading-none"
          >
            ▼
          </button>
        </div>
      )}
    </div>
  );
}
