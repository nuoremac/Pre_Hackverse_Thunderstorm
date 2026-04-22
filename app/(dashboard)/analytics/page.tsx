import { AnalyticsWorkspace } from "@/components/dashboard/analytics-workspace";
import { loadAnalyticsPageData } from "@/lib/server/workspace-data";

export default async function AnalyticsPage() {
  const initialData = await loadAnalyticsPageData();
  return <AnalyticsWorkspace initialData={initialData} />;
}
