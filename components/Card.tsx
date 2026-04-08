import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  border?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  className = "",
  padding = "md",
  border = true,
  glow = false,
}: CardProps) {
  const paddingSizes = {
    sm: "p-4",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
  };

  return (
    <div
      className={cn(
        "bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)]",
        border && "border border-[var(--color-border)]",
        glow && "shadow-[var(--shadow-glow)]",
        paddingSizes[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
