"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, CalendarDays, Brain } from "lucide-react";

type ScheduleBlock = {
  time: string;
  title: string;
  tone: string;
};

type Task = {
  name: string;
  score: number;
};

const initialSchedule: ScheduleBlock[] = [
  { time: "08:00", title: "Daily Sync", tone: "bg-[rgba(142,179,255,0.08)] border-[rgba(142,179,255,0.22)] text-blue-800" },
  { time: "10:30", title: "Deep Work Block", tone: "bg-[rgba(123,242,182,0.08)] border-[rgba(123,242,182,0.22)] text-emerald-800" }
];

const backlogTasks: Task[] = [
  { name: "Write Database Schema", score: 92 },
  { name: "Prepare Pitch Deck", score: 81 },
  { name: "UI Polish Pass", score: 68 },
  { name: "Answer Emails", score: 45 }
];

export function MockPlanner() {
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(initialSchedule);
  const [queue, setQueue] = useState<Task[]>(backlogTasks);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Start the simulation after a short delay
    const timer = setTimeout(() => {
      setIsSimulating(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isSimulating || queue.length === 0) return;

    const interval = setInterval(() => {
      setQueue((prevQueue) => {
        if (prevQueue.length === 0) {
          clearInterval(interval);
          return prevQueue;
        }

        const taskToSchedule = prevQueue[0];
        const newQueue = prevQueue.slice(1);
        
        // Dynamically add to schedule
        let timeLabel = prevQueue.length === 4 ? "12:00" : (prevQueue.length === 3 ? "14:00" : (prevQueue.length === 2 ? "16:00" : "18:00"));

        setSchedule((prev) => [
          ...prev,
          { 
            time: timeLabel, 
            title: taskToSchedule.name, 
            tone: "bg-[rgba(255,141,98,0.08)] border-[rgba(255,141,98,0.22)] text-orange-800 animate-in fade-in zoom-in duration-500" 
          }
        ]);

        return newQueue;
      });
    }, 2500); // Add a task every 2.5s

    return () => clearInterval(interval);
  }, [isSimulating, queue.length]);

  return (
    <div className="panel-card grid-overlay relative overflow-hidden p-5 md:p-8 bg-white/60 backdrop-blur-md">
      <div className="pointer-events-none absolute -right-10 top-[-3rem] h-40 w-40 bg-[radial-gradient(circle,_rgba(21,184,106,0.12),_transparent_70%)] blur-3xl drift-slow" />
      <div className="pointer-events-none absolute left-[-3rem] top-[40%] h-32 w-32 bg-[radial-gradient(circle,_rgba(72,124,255,0.12),_transparent_70%)] blur-3xl drift-fast" />

      <div className="relative flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)] flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Today's Plan
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
              Auto-Scheduled Daily View
            </h2>
          </div>

          <div className="flex items-center gap-2 border border-[rgba(21,184,106,0.3)] bg-[rgba(21,184,106,0.05)] px-4 py-2 text-sm font-semibold text-[var(--ink)] rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-dark)]" /> Optimal Plan Generated
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-[var(--line)] bg-[rgba(255,255,255,0.9)] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <p className="text-sm font-semibold flex items-center gap-2 text-[var(--ink)]">
                <Clock className="w-4 h-4 text-[var(--muted)]" /> Live Timeline
              </p>
              <p className="text-xs font-semibold text-[var(--accent-dark)] bg-green-50 px-2 py-1 rounded">
                Dynamic Updates
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {schedule.map((block, i) => (
                <div key={i} className="grid grid-cols-[3.5rem_1fr] gap-4 items-start transition-all">
                  <span className="pt-2 text-xs font-semibold text-[var(--muted)] text-right">
                    {block.time}
                  </span>
                  <div className={`border px-4 py-3 rounded-xl shadow-sm transition-all hover:scale-[1.02] ${block.tone}`}>
                    <p className="font-display text-lg font-semibold tracking-[-0.02em]">
                      {block.title}
                    </p>
                  </div>
                </div>
              ))}
              {isSimulating && queue.length > 0 && (
                <div className="grid grid-cols-[3.5rem_1fr] gap-4 items-center animate-pulse opacity-50">
                   <span className="text-xs font-semibold text-[var(--muted)] text-right">--:--</span>
                   <div className="border border-dashed border-[var(--line)] rounded-xl py-4 bg-gray-50 flex justify-center">
                     <p className="text-xs text-[var(--muted)]">AI Engine Computing placement...</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="border border-[var(--line)] bg-[rgba(255,255,255,0.9)] p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4" /> Priority Queue
              </p>
              <div className="space-y-3">
                {queue.length === 0 ? (
                  <p className="text-sm text-center py-4 text-[var(--muted)] italic">Backlog Cleared!</p>
                ) : (
                  queue.map((task) => (
                    <div
                      key={task.name}
                      className="flex items-center justify-between border border-[var(--line)] bg-white px-4 py-3 rounded-xl shadow-sm transition-all"
                    >
                      <span className="text-sm font-semibold text-[var(--ink)] truncate pr-2">
                        {task.name}
                      </span>
                      <span className="shrink-0 border border-[rgba(21,184,106,0.2)] bg-[rgba(21,184,106,0.08)] px-2 py-1 text-xs font-bold text-[var(--accent-dark)] rounded">
                        P: {task.score}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-[var(--line)] bg-[rgba(255,255,255,0.9)] p-5 rounded-2xl shadow-sm text-sm text-[var(--muted)] leading-relaxed">
              <p className="font-semibold text-[var(--ink)] mb-2">Live Engine Log</p>
              <ul className="space-y-2 list-disc pl-4 text-xs">
                <li>Overload check passed.</li>
                <li>Tasks sorted by completion risk.</li>
                {schedule.length > 2 && <li className="text-green-600 font-medium">New tasks slotted around hard constraints!</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
