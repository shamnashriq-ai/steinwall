"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  Database,
  Map,
  FileCheck,
  Settings,
  HelpCircle,
  X,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/materiality", label: "Materiality Assessment", icon: Target },
  { href: "/data-collection", label: "Scope 1, 2, 3 Data", icon: Database },
  { href: "/strategy", label: "Strategy Builder", icon: Map },
  { href: "/audit-trail", label: "Audit Trail", icon: FileCheck },
];

const secondaryItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-surface border-r border-neutral-lighter flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-lighter">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 bg-primary rounded-[var(--radius-sm)] flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[18px] font-[family-name:var(--font-display)] font-semibold text-primary">
              Steinwall
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-text-primary cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-neutral-light hover:text-text-primary"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-lighter py-4 px-3 flex flex-col gap-1">
          {secondaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium transition-colors ${
                pathname === item.href
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-neutral-light hover:text-text-primary"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          ))}
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium text-text-secondary hover:bg-neutral-light hover:text-text-primary transition-colors"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            Help & Support
          </a>
        </div>
      </aside>
    </>
  );
}
