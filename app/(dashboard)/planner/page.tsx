import { PlannerWorkspace } from "@/components/calendar/planner-workspace";
import { loadPlannerPageData } from "@/lib/server/workspace-data";

export default async function PlannerPage() {
  const initialData = await loadPlannerPageData();
  return (
    <div className="h-full flex flex-col pt-8">
      <div className="px-8 pb-4 border-b border-[var(--line)]">
        <h1 className="text-3xl font-display font-bold text-[var(--ink)]">Plan your Week</h1>
        <p className="text-[var(--muted)] text-sm mt-1">Review the AI recommendations and adjust constraints.</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <PlannerWorkspace initialData={initialData} />
      </div>
    </div>
  );
}
