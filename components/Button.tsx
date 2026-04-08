import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-normal tracking-wide transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-[var(--radius-md)] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/25 disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-white text-[#0a0a0a] hover:bg-white/85 active:bg-white/75",
    secondary:
      "bg-[rgba(255,255,255,0.06)] text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.14)]",
    outline:
      "border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[rgba(255,255,255,0.03)] active:bg-[rgba(255,255,255,0.06)]",
    ghost:
      "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]",
  };

  const sizes = {
    sm: "px-4 py-2 text-[0.75rem] tracking-[0.08em] uppercase",
    md: "px-5 py-2.5 text-[0.8rem] tracking-[0.04em]",
    lg: "px-7 py-3.5 text-[0.85rem] tracking-[0.04em]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}
