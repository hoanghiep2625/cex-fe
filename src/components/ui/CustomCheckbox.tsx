import { LuCheck } from "react-icons/lu";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
  className = "",
}: CustomCheckboxProps) {
  return (
    <div className={`flex gap-2 items-center cursor-pointer ${className}`}>
      <button
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 border rounded flex items-center justify-center transition shrink-0 ${
          checked
            ? "dark:bg-white dark:border-white bg-black border-black"
            : "dark:bg-[#181A20] dark:border-white bg-white border-gray-400"
        }`}
      >
        {checked && (
          <LuCheck size={16} className="dark:text-[#181A20] text-white" />
        )}
      </button>
      {label && (
        <p className="dark:text-white text-black text-xs select-none">
          {label}
        </p>
      )}
    </div>
  );
}
