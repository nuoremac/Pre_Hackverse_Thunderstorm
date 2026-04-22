import { LayoutDashboard, Settings2, Play, CalendarSync } from "lucide-react";

// Maintain all data models
const capacityCards = [
  { label: "Scheduled this week", value: "23h 30m", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Feasibility", value: "92%", tone: "bg-green-50 text-green-700 border-green-200" },
  { label: "Overload risk", value: "Low", tone: "bg-gray-50 text-gray-700 border-gray-200" }
];

const taskBacklog = [
  { title: "Prepare system design review", meta: "3h 30m · due Thu 16:00", score: 94, state: "Critical", tone: "border-red-200 bg-red-50 text-red-700" },
  { title: "Database migrations", meta: "2h · due Fri 09:00", score: 82, state: "High", tone: "border-orange-200 bg-orange-50 text-orange-700" },
  { title: "Mock interview practice", meta: "1h 30m · due Sat 11:00", score: 61, state: "Medium", tone: "border-blue-200 bg-blue-50 text-blue-700" }
];

const fixedEvents = [
  "Tue 10:00 - 12:00 · Distributed systems class",
  "Wed 14:00 - 15:30 · Team sync",
  "Thu 08:00 - 10:00 · Lab session"
];

const boardColumns = [
  {
    day: "Tuesday", date: "Apr 21",
    sessions: [
      { time: "08:00 - 09:30", title: "Prepare system design review", note: "Placed in a high-focus slot because the deadline is near and the task is difficult.", tone: "bg-green-50 border-green-200" },
      { time: "12:30 - 13:30", title: "Break + reading review", note: "Recovery block inserted after class to keep the day balanced.", tone: "bg-white border-gray-200" },
      { time: "16:00 - 18:00", title: "Database migrations", note: "Placed after the fixed class window to avoid interruption.", tone: "bg-blue-50 border-blue-200" }
    ]
  },
  {
    day: "Wednesday", date: "Apr 22",
    sessions: [
      { time: "07:30 - 09:00", title: "Prepare system design review", note: "Second chunk created because the task is splittable.", tone: "bg-green-50 border-green-200" },
      { time: "10:00 - 11:00", title: "Mock interview practice", note: "Lower urgency item placed in a medium-focus slot.", tone: "bg-white border-gray-200" },
      { time: "16:00 - 17:30", title: "Deck polish", note: "Late-day work reserved for lighter execution.", tone: "bg-orange-50 border-orange-200" }
    ]
  },
  {
    day: "Thursday", date: "Apr 23",
    sessions: [
      { time: "10:30 - 12:00", title: "Final review rehearsal", note: "Scheduled immediately after the hard lab constraint.", tone: "bg-orange-50 border-orange-200" },
      { time: "14:00 - 16:00", title: "Design review presentation", note: "Deadline-aligned block with margin before submission.", tone: "bg-green-50 border-green-200" }
    ]
  }
];

const explanationItems = [
  { label: "Why this slot", body: "Tuesday 08:00 was preferred because it sits before the Thursday deadline, matches the best focus window, and still leaves space for a second chunk." },
  { label: "Constraints satisfied", body: "No overlap with class or meetings, daily workload stays under the threshold, and the task finishes with spare margin before the deadline." },
  { label: "Fallback if missed", body: "If the Tuesday block is missed, the system can move 90 minutes to Wednesday morning and push lower-priority work toward Friday." }
];

const activityFeed = [
  "Priority recalculated after a new deadline was added.",
  "One deep-work session split into two valid blocks.",
  "Thursday workload remains below the overload threshold."
];

export function PlannerWorkspace() {
  return (
    <div className="p-8 h-full flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
         <div className="flex items-center gap-4">
            {capacityCards.map((card) => (
              <div key={card.label} className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${card.tone}`}>
                <span className="text-xs font-bold uppercase tracking-wider">{card.label}:</span>
                <span className="text-sm font-semibold">{card.value}</span>
              </div>
            ))}
         </div>

         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Settings2 className="w-4 h-4" /> Parameters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white border border-[var(--ink)] rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md">
              <CalendarSync className="w-4 h-4" /> Generate Planning
            </button>
         </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_300px] gap-6 flex-1 items-start">
        
        {/* Left Column: Input State */}
        <aside className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[var(--line)] shadow-sm flex flex-col h-full overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--ink)]">Task Backlog</h2>
              <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded">3 Queued</span>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {taskBacklog.map((task) => (
                <div key={task.title} className={`border rounded-lg p-3 ${task.tone}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-bold leading-tight">{task.title}</p>
                    <span className="text-xs font-bold bg-white px-2 shadow-sm rounded">{task.score}</span>
                  </div>
                  <p className="text-xs opacity-80 mb-2">{task.meta}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider">{task.state}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[var(--line)] shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)]">
              <h2 className="text-sm font-bold text-[var(--ink)]">Hard Constraints</h2>
            </div>
            <div className="p-4 space-y-2">
              {fixedEvents.map((event) => (
                <div key={event} className="bg-gray-50 border border-gray-100 rounded text-xs px-3 py-2 text-gray-600 font-medium">
                  {event}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Column: The Output Schedule */}
        <div className="bg-white rounded-xl border border-[var(--line)] shadow-sm h-full flex flex-col overflow-hidden">
           <div className="bg-gray-50 px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
             <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
               <Play className="w-4 h-4 text-[var(--accent)]" /> Optimized Schedule Board
             </h2>
             <span className="text-xs font-semibold text-[var(--accent-dark)] bg-green-50 border border-green-200 rounded px-2 py-1">Hard rules respected</span>
           </div>
           
           <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4">
              <div className="flex flex-col gap-8">
                {boardColumns.map((column) => (
                  <div key={column.day} className="flex flex-col">
                    <div className="sticky top-0 z-10 flex items-baseline gap-3 bg-gray-50/95 backdrop-blur-md py-3 px-2 border-b border-gray-200 mb-4">
                      <p className="font-bold text-[var(--ink)] text-lg tracking-tight">{column.day}</p>
                      <p className="text-sm border-l border-gray-300 pl-3 text-gray-500 font-medium">{column.date}</p>
                      <span className="ml-auto text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded border shadow-sm tracking-wider uppercase">{column.sessions.length} events</span>
                    </div>

                    <div className="space-y-4 px-2">
                      {column.sessions.map((session) => (
                        <div key={`${column.day}-${session.time}-${session.title}`} className={`group flex gap-4 p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${session.tone}`}>
                          <div className="shrink-0 w-24 pt-1">
                            <p className="text-xs font-bold text-gray-600 block">{session.time.split(" - ")[0]}</p>
                            <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{session.time.split(" - ")[1]}</p>
                          </div>
                          
                          <div className="border-l-2 border-inherit pl-4 flex-1">
                            <p className="text-sm font-bold text-[var(--ink)] leading-tight">{session.title}</p>
                            <p className="text-xs text-gray-600 mt-2 leading-relaxed opacity-90">{session.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Right Column: Explanations */}
        <aside className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[var(--line)] shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)]">
              <h2 className="text-sm font-bold text-[var(--ink)]">Decision Explanations</h2>
            </div>
            <div className="p-4 space-y-4">
              {explanationItems.map((item) => (
                <div key={item.label} className="border-l-4 border-[var(--accent)] pl-3 bg-gray-50 p-2 rounded-r-lg">
                  <p className="text-xs font-bold text-[var(--accent-dark)] uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[var(--line)] shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-[var(--line)]">
              <h2 className="text-sm font-bold text-[var(--ink)]">Engine Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {activityFeed.map((activity, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-sm" />
                  <p className="text-xs text-gray-600 leading-snug">{activity}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
