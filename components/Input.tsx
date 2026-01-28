import { ReactNode } from "react";

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  label,
  error,
  required = false,
  className = "",
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-500 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 border border-gray-300 rounded-lg
          text-base font-400 transition-all
          focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? "border-red-500" : ""}
          ${className}
        `}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
