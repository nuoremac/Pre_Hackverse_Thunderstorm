import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { loadDashboardShellUser } from "@/lib/server/workspace-data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await loadDashboardShellUser();

  return (
    <DashboardShell user={user}>{children}</DashboardShell>
  );
}
