"use client";

import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[14px] font-medium text-neutral">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full bg-surface border rounded-[var(--radius-sm)] px-4 py-3 text-[16px] font-[family-name:var(--font-body)] text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-3 focus:ring-primary-light outline-none transition-colors ${
            error ? "border-error bg-error/5" : "border-neutral-lighter"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[13px] text-error">{error}</p>}
        {helperText && !error && <p className="text-[13px] text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[14px] font-medium text-neutral">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-surface border rounded-[var(--radius-sm)] px-4 py-3 text-[16px] font-[family-name:var(--font-body)] text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-3 focus:ring-primary-light outline-none transition-colors resize-y min-h-[100px] ${
            error ? "border-error bg-error/5" : "border-neutral-lighter"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[13px] text-error">{error}</p>}
        {helperText && !error && <p className="text-[13px] text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[14px] font-medium text-neutral">{label}</label>
        )}
        <select
          ref={ref}
          className={`w-full bg-surface border border-neutral-lighter rounded-[var(--radius-sm)] px-4 py-3 text-[16px] font-[family-name:var(--font-body)] text-text-primary focus:border-primary focus:ring-3 focus:ring-primary-light outline-none transition-colors appearance-none ${className}`}
          {...props}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {helperText && <p className="text-[13px] text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
