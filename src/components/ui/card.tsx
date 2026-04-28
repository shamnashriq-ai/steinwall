import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-surface border border-neutral-lighter rounded-[var(--radius-md)] p-5 ${className}`}>
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: "success" | "warning" | "error" | "neutral";
}

const statusColors = {
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  neutral: "text-primary",
};

export function MetricCard({ label, value, unit, status = "neutral" }: MetricCardProps) {
  return (
    <div className="bg-surface rounded-[var(--radius-md)] p-5">
      <p className="text-[13px] uppercase tracking-wider text-text-secondary font-medium mb-1">{label}</p>
      <p className={`text-[28px] font-[family-name:var(--font-display)] font-semibold ${statusColors[status]}`}>
        {value}
        {unit && <span className="text-[14px] text-text-secondary ml-1">{unit}</span>}
      </p>
    </div>
  );
}

interface AlertCardProps {
  children: ReactNode;
  variant: "success" | "warning" | "error" | "info";
  className?: string;
}

const alertStyles = {
  success: "bg-success-light border-l-4 border-l-success",
  warning: "bg-warning-light border-l-4 border-l-warning",
  error: "bg-error-light border-l-4 border-l-error",
  info: "bg-primary-light border-l-4 border-l-primary",
};

export function AlertCard({ children, variant, className = "" }: AlertCardProps) {
  return (
    <div className={`rounded-[var(--radius-sm)] p-4 ${alertStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}
