import { Check } from "lucide-react";

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
          checked ? "bg-white border-white" : "bg-[#181A20] border-white"
        }`}
      >
        {checked && <Check size={16} className="text-[#181A20]" />}
      </button>
      {label && <p className="text-white text-xs select-none">{label}</p>}
    </div>
  );
}
