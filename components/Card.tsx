import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  border?: boolean;
}

export function Card({
  children,
  className = "",
  padding = "md",
  border = true,
}: CardProps) {
  const paddingSizes = {
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
        bg-white rounded-lg
        ${border ? "border border-gray-200" : ""}
        ${paddingSizes[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
