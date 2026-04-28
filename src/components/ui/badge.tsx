import { type ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  error: "bg-error-light text-error",
  neutral: "bg-neutral-light text-neutral",
  info: "bg-primary-light text-primary",
};

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${badgeStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
