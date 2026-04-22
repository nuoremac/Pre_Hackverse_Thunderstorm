import { BarChart, Clock, CalendarCheck, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8 md:p-10 pb-24 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div className="reveal-up">
          <h1 className="text-3xl font-display font-bold text-[var(--ink)] tracking-tight">Good morning, Thunderstorm.</h1>
          <p className="text-lg text-[var(--muted)] mt-2">Here is the state of your automated schedule for the week.</p>
        </div>
        <button className="btn-primary !py-2.5 !px-5 !text-sm rounded-xl shadow-md hover:-translate-y-1 transition-transform duration-200 reveal-up">
          Sync Calendar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 reveal-up delay-1">
        <div className="p-6 bg-white rounded-2xl border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Deep Work Secured</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-display font-bold text-[var(--ink)]">24h</p>
            <span className="text-sm text-green-600 font-medium">+4h vs last week</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4 border border-green-100">
            <CalendarCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tasks Completed</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-display font-bold text-[var(--ink)]">18</p>
            <span className="text-sm text-gray-400 font-medium">/ 22 planned</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-4 border border-purple-100">
            <BarChart className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Schedule Adherence</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-display font-bold text-[var(--ink)]">94%</p>
            <span className="text-sm text-green-600 font-medium">Optimal</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-red-200 shadow-sm relative overflow-hidden bg-red-50/30">
          <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
             <AlertTriangle className="w-32 h-32 text-red-500" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4 border border-red-200 relative z-10">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider relative z-10">Overload Warning</p>
          <p className="text-xl font-display font-bold text-red-900 leading-tight relative z-10">Thursday is overbooked by 2h.</p>
          <Link href="/planner" className="text-sm font-bold text-red-600 hover:text-red-700 mt-2 inline-flex items-center gap-1 relative z-10">
             Reschedule <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout for Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 reveal-up delay-2">
         
         {/* Today's Timeline */}
         <div className="bg-white rounded-3xl border border-[var(--line)] shadow-sm p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--line)]">
              <h2 className="text-xl font-bold font-display text-[var(--ink)]">Today's Timeline</h2>
              <span className="text-sm text-[var(--muted)]">April 14, 2026</span>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[var(--accent)] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--accent-soft)] bg-green-50/50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[var(--ink)] text-sm">Deep Work: Architecture</h3>
                    <time className="text-xs font-semibold text-[var(--accent-dark)]">09:00 AM</time>
                  </div>
                  <p className="text-sm text-gray-500">Drafting the Next.js routing patterns.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-700 text-sm">Team Sync</h3>
                    <time className="text-xs font-semibold text-gray-400">11:30 AM</time>
                  </div>
                  <p className="text-sm text-gray-500">Weekly standup and blocker reviews.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-orange-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-700 text-sm">Review PRs</h3>
                    <time className="text-xs font-semibold text-gray-400">02:00 PM</time>
                  </div>
                  <p className="text-sm text-gray-500">OptiTime integration merge requests.</p>
                </div>
              </div>

            </div>
         </div>

         {/* Priority Backlog */}
         <div className="bg-white rounded-3xl border border-[var(--line)] shadow-sm p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-display text-[var(--ink)]">Urgent Backlog</h2>
              <Link href="/tasks" className="text-sm text-[var(--accent)] font-semibold hover:underline">View all</Link>
            </div>

            <div className="flex-1 space-y-4">
              {[
                { title: "Fix Database Memory Leak", priority: "P0", color: "text-red-700 bg-red-100 border-red-200" },
                { title: "Update Terms of Service", priority: "P1", color: "text-orange-700 bg-orange-100 border-orange-200" },
                { title: "Review Q2 Analytics", priority: "P2", color: "text-blue-700 bg-blue-100 border-blue-200" },
                { title: "Setup CI/CD Actions", priority: "P2", color: "text-blue-700 bg-blue-100 border-blue-200" },
              ].map((task, i) => (
                <div key={i} className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
                  <span className="text-sm text-[var(--ink)] font-medium truncate pr-4">{task.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border ${task.color}`}>{task.priority}</span>
                </div>
              ))}
            </div>
            
            <button className="mt-6 w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-semibold hover:bg-gray-50 hover:text-gray-700 transition-colors">
              + Add Quick Task
            </button>
         </div>

      </div>

    </div>
  );
}
