"use client";

import { Menu, User } from "lucide-react";
import { useSteinwall } from "@/lib/context";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data } = useSteinwall();

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-neutral-lighter px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-text-secondary hover:text-text-primary cursor-pointer">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          {data.companyName && (
            <span className="text-[14px] font-medium text-text-primary">{data.companyName}</span>
          )}
          {data.industry && (
            <span className="text-[13px] text-text-secondary ml-2">· {data.industry}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {data.auditDueDate && (
          <span className="text-[13px] text-text-secondary hidden sm:block">
            Audit due: {new Date(data.auditDueDate).toLocaleDateString()}
          </span>
        )}
        <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
