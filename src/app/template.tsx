import { AppShell } from "@/components/layout/shell";

export default function Template({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
