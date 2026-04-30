"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/shell";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/landing") {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
