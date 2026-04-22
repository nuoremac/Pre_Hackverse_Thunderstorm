import { Search, Filter, Plus, MoreVertical, Circle, Clock, CheckCircle2, Calendar } from "lucide-react";

const mockTasks = [
  { id: "TSK-01", title: "Prepare system design review", category: "Engineering", duration: "3h 30m", deadline: "Thursday, 16:00", priority: "P0", status: "To Do" },
  { id: "TSK-02", title: "Database migrations", category: "Engineering", duration: "2h 00m", deadline: "Friday, 09:00", priority: "P1", status: "To Do" },
  { id: "TSK-03", title: "Mock interview practice", category: "Career", duration: "1h 30m", deadline: "Saturday, 11:00", priority: "P2", status: "To Do" },
  { id: "TSK-04", title: "Write weekly update", category: "Admin", duration: "0h 45m", deadline: "Friday, 17:00", priority: "P2", status: "Done" },
  { id: "TSK-05", title: "Optimize Next.js image loading", category: "Engineering", duration: "2h 00m", deadline: "Next Week", priority: "P1", status: "In Progress" },
  { id: "TSK-06", title: "Review Q1 Analytics", category: "Product", duration: "1h 00m", deadline: "Tomorrow, 14:00", priority: "P1", status: "To Do" },
];

export default function TasksPage() {
  return (
    <div className="p-8 md:p-10 max-w-[1400px] mx-auto h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--ink)] tracking-tight">Task Backlog</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Manage all unscheduled work before the AI processes it.</p>
        </div>
        <button className="btn-primary !py-2.5 !px-5 !text-sm rounded-xl shadow-md hover:-translate-y-1 transition-transform duration-200 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 relative z-10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-sm"
          />
        </div>
        
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Task List container */}
      <div className="bg-white border border-[var(--line)] rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
         
         {/* Table Header */}
         <div className="grid grid-cols-[1fr_120px_100px_150px_80px_40px] gap-4 px-6 py-3 bg-gray-50 border-b border-[var(--line)] text-xs font-semibold text-gray-500 uppercase tracking-wider">
           <div>Task Details</div>
           <div>Category</div>
           <div>Est. Time</div>
           <div>Deadline</div>
           <div>Priority</div>
           <div></div>
         </div>

         {/* Table Body */}
         <div className="overflow-y-auto flex-1">
           {mockTasks.map((task) => (
             <div key={task.id} className="grid grid-cols-[1fr_120px_100px_150px_80px_40px] items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group cursor-pointer">
               
               {/* Details */}
               <div className="flex items-center gap-3 overflow-hidden">
                 {task.status === "Done" ? (
                   <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                 ) : task.status === "In Progress" ? (
                   <div className="w-5 h-5 shrink-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                 ) : (
                   <Circle className="w-5 h-5 text-gray-300 shrink-0 group-hover:text-gray-400" />
                 )}
                 <div className="truncate">
                   <p className={`text-sm font-bold truncate ${task.status === "Done" ? "text-gray-400 line-through" : "text-[var(--ink)]"}`}>
                     {task.title}
                   </p>
                   <p className="text-xs text-gray-400 mt-0.5">{task.id}</p>
                 </div>
               </div>

               {/* Category */}
               <div className="truncate">
                 <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider truncate max-w-full">
                   {task.category}
                 </span>
               </div>

               {/* Duration */}
               <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> {task.duration}
               </div>

               {/* Deadline */}
               <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium whitespace-nowrap truncate">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
                  <span className={`${task.priority === "P0" && task.status !== "Done" ? "text-red-600 font-bold" : ""}`}>
                     {task.deadline}
                  </span>
               </div>

               {/* Priority */}
               <div>
                  <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-[11px] font-bold border shadow-sm ${
                    task.priority === "P0" ? "bg-red-50 text-red-700 border-red-200" :
                    task.priority === "P1" ? "bg-orange-50 text-orange-700 border-orange-200" :
                    "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {task.priority}
                  </span>
               </div>

               {/* Actions */}
               <div className="flex justify-end">
                 <button className="text-gray-400 hover:text-[var(--ink)] p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                   <MoreVertical className="w-4 h-4" />
                 </button>
               </div>
             </div>
           ))}
         </div>
         
         {/* Footer/Summary */}
         <div className="bg-gray-50 border-t border-[var(--line)] px-6 py-3 text-xs text-gray-500 font-medium flex justify-between items-center">
            <p>Showing {mockTasks.length} tasks</p>
            <p className="text-gray-400">Total estimated duration: ~10h 15m</p>
         </div>

      </div>
    </div>
  );
}
