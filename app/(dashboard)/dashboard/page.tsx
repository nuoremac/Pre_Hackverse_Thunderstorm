import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { loadDashboardPageData } from "@/lib/server/workspace-data";

export default async function DashboardPage() {
  const initialData = await loadDashboardPageData();
  return <DashboardOverview initialData={initialData} />;
}
