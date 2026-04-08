import { cn } from "@/lib/utils";

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
        <label className="block text-[0.7rem] font-normal tracking-[0.12em] uppercase text-[var(--color-text-muted)] mb-3 font-[family-name:var(--font-mono)]">
          {label}
          {required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)]",
          "text-[0.9rem] font-light text-[var(--color-text-primary)] placeholder:text-[var(--color-text-dim)]",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "focus:outline-none focus:border-[var(--color-border-focus)] focus:bg-[var(--color-bg-surface)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          error && "border-[var(--color-error-border)]",
          className
        )}
      />
      {error && <p className="text-[var(--color-error)] text-[0.75rem] mt-2 font-light">{error}</p>}
    </div>
  );
}
