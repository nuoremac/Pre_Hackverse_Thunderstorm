import { SettingsWorkspace } from "@/components/dashboard/settings-workspace";
import { loadSettingsPageData } from "@/lib/server/workspace-data";

export default async function SettingsPage() {
  const initialData = await loadSettingsPageData();
  return <SettingsWorkspace initialData={initialData} />;
}
