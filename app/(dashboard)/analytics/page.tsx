import { TrendingUp, Activity, PieChart, BarChart3, AlertCircle, Calendar, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";

const weeklyData = [
  { day: "Mon", focus: 4, drift: 2, total: 6 },
  { day: "Tue", focus: 7, drift: 1, total: 8 },
  { day: "Wed", focus: 5, drift: 3, total: 8 },
  { day: "Thu", focus: 6, drift: 2, total: 8 },
  { day: "Fri", focus: 3, drift: 4, total: 7 },
  { day: "Sat", focus: 2, drift: 1, total: 3 },
  { day: "Sun", focus: 0, drift: 0, total: 0 },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8 md:p-10 max-w-[1400px] mx-auto h-full flex flex-col font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--ink)] tracking-tight">Analytics & Momentum</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Track your deep work patterns and algorithmic efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
             <Calendar className="w-4 h-4" /> Last 30 Days
           </button>
           <button className="btn-primary !px-5 !py-2.5 !text-sm rounded-xl">
             Export Report
           </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Activity className="w-24 h-24 text-[var(--accent)]" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Total Focus Time</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-display font-bold text-[var(--ink)] tracking-tighter">84h</span>
              <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                 <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Versus previous period (75h)</p>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Zap className="w-24 h-24 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Efficiency Score</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-display font-bold text-[var(--ink)] tracking-tighter">92</span>
              <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                 <ArrowUpRight className="w-3 h-3 mr-0.5" /> 3 pts
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Based on completed vs. scheduled work</p>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <AlertCircle className="w-24 h-24 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Burnout Risk</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-display font-bold text-[var(--ink)] tracking-tighter">Low</span>
              <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                 Optimal
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
               <div className="bg-[var(--accent)] w-1/4 h-full rounded-full"></div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8 flex-1">
         
         {/* Chart Section */}
         <div className="bg-white rounded-3xl border border-[var(--line)] shadow-sm p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-lg font-bold font-display text-[var(--ink)] flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-[var(--accent)]" /> Focus vs. Drift Velocity
               </h2>
               <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--accent)]"></span> Deep Work (Focus)</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-200"></span> Shallow Work (Drift)</div>
               </div>
            </div>
            
            {/* CSS Faux Chart */}
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-6 mt-4 relative pt-10">
               {/* Y-Axis Lines */}
               <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                  {[10, 8, 6, 4, 2, 0].map(val => (
                    <div key={val} className="border-t border-dashed border-gray-200 w-full flex items-center relative">
                      <span className="absolute -left-6 text-[10px] font-bold text-gray-400 bg-white pr-2 -translate-y-1/2">{val}h</span>
                    </div>
                  ))}
               </div>

               {weeklyData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                    <div className="w-full max-w-[3rem] bg-blue-200 rounded-t-sm transition-all duration-300 relative group-hover:opacity-90 flex flex-col justify-end overflow-hidden" style={{ height: `${(data.total / 10) * 100}%` }}>
                       {/* Stack internal */}
                       <div className="w-full bg-[var(--accent)] absolute bottom-0 left-0" style={{ height: `${(data.focus / data.total) * 100}%` }}></div>
                    </div>
                    <span className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">{data.day}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Sidebar Insights */}
         <div className="flex flex-col gap-6">
            
            <div className="bg-[var(--ink)] text-white rounded-3xl border border-gray-800 shadow-xl p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
               
               <h2 className="text-lg font-bold font-display flex items-center gap-2 mb-6">
                 <TrendingUp className="w-5 h-5 text-[var(--accent)]" /> OptiTime Insights
               </h2>
               
               <div className="space-y-6">
                  <div className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-[var(--accent)] before:rounded-full">
                     <p className="text-sm font-bold mb-1">Peak Productivity Window</p>
                     <p className="text-xs text-gray-400">You consistently resolve critical path tasks between <span className="text-white font-semibold">09:00 AM – 11:30 AM</span>.</p>
                  </div>
                  <div className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-[var(--secondary)] before:rounded-full">
                     <p className="text-sm font-bold mb-1">Context Switching Penalty</p>
                     <p className="text-xs text-gray-400">Your schedule averaged 4 context switches daily this week. We will attempt to batch your meetings next week.</p>
                  </div>
                  <div className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-orange-400 before:rounded-full">
                     <p className="text-sm font-bold mb-1">Friday Slope</p>
                     <p className="text-xs text-gray-400">Deep work completion drops 45% on Fridays. We recommend shifting P0 tasks to early-week slots.</p>
                  </div>
               </div>
               
               <button className="mt-8 w-full py-2.5 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10 transition-colors">
                  Generate Weekly Action Plan
               </button>
            </div>

            <div className="bg-white rounded-3xl border border-[var(--line)] shadow-sm p-6 flex flex-col justify-center items-center h-full">
               <PieChart className="w-16 h-16 text-gray-200 mb-4" />
               <p className="text-sm font-bold text-gray-600 mb-1">Time Distribution Sync</p>
               <p className="text-xs text-center text-gray-400 mb-4">Connect external tooling (Jira, GitHub) to unlock detailed categorization and time-slicing charts.</p>
               <button className="text-sm font-bold text-[var(--accent-dark)] hover:underline">Connect Integrations</button>
            </div>

         </div>

      </div>
    </div>
  );
}
