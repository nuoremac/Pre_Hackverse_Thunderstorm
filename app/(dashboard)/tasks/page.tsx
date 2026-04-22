import { TasksWorkspace } from "@/components/dashboard/tasks-workspace";
import { loadTasksPageData } from "@/lib/server/workspace-data";

export default async function TasksPage() {
  const initialData = await loadTasksPageData();
  return <TasksWorkspace initialData={initialData} />;
}
