"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "success" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white border-primary hover:bg-primary-dark",
  secondary: "bg-transparent text-primary border-primary hover:bg-primary-light",
  destructive: "bg-transparent text-error border-error hover:bg-error-light",
  success: "bg-success-light text-success border-success hover:bg-success",
  ghost: "bg-transparent text-text-secondary border-transparent hover:bg-neutral-light",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-5 py-3 text-[14px]",
  lg: "px-6 py-3.5 text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 border rounded-[var(--radius-sm)] font-[family-name:var(--font-body)] font-medium cursor-pointer transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
