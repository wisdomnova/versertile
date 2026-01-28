interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export function Textarea({
  placeholder,
  value,
  onChange,
  disabled = false,
  label,
  error,
  required = false,
  rows = 6,
  className = "",
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-500 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-4 py-2.5 border border-gray-300 rounded-lg
          text-base font-400 transition-all resize-none
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
