import { cn } from "@/lib/utils";

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
        <label className="block text-[0.7rem] font-normal tracking-[0.12em] uppercase text-[var(--color-text-muted)] mb-3 font-[family-name:var(--font-mono)]">
          {label}
          {required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={cn(
          "w-full px-4 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)]",
          "text-[0.9rem] font-light text-[var(--color-text-primary)] placeholder:text-[var(--color-text-dim)]",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] resize-none",
          "focus:outline-none focus:border-[var(--color-border-focus)] focus:bg-[var(--color-bg-surface)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "leading-relaxed",
          error && "border-[var(--color-error-border)]",
          className
        )}
      />
      {error && <p className="text-[var(--color-error)] text-[0.75rem] mt-2 font-light">{error}</p>}
    </div>
  );
}
