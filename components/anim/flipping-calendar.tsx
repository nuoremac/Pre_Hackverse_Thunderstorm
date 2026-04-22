"use client";

import { useEffect, useState } from "react";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

export function FlippingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    // We update the calendar every 1.5 seconds.
    // The CSS animation flipPage lasts 1.2s.
    const interval = setInterval(() => {
      setCurrentDate((prev) => {
        const next = new Date(prev);
        next.setDate(prev.getDate() + 1);
        return next;
      });
      setFlipKey((prev) => prev + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

  return (
    <div className="relative w-56 h-64 bg-white rounded-3xl shadow-2xl border border-[var(--line)] perspective-calendar flex flex-col items-center justify-start mx-auto -rotate-2 hover:rotate-0 transition-transform duration-500 hover:scale-105">
       {/* Binder Rings */}
       <div className="absolute -top-3 w-full flex justify-center gap-10 z-30">
          <div className="w-4 h-10 bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 rounded-full shadow-md border border-gray-500"></div>
          <div className="w-4 h-10 bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 rounded-full shadow-md border border-gray-500"></div>
       </div>
       
       <div className="w-full h-14 bg-gradient-to-b from-[var(--accent-dark)] to-[var(--accent)] text-white text-xs font-bold tracking-[0.2em] uppercase flex items-end justify-center pb-2 z-20 shadow-md border-b-2 border-green-800 rounded-t-3xl pt-2">
         {months[currentDate.getMonth()]} {currentDate.getFullYear()}
       </div>

       {/* Sub-Layer: Next Date */}
       <div className="absolute top-14 left-0 w-full h-[calc(100%-3.5rem)] flex flex-col items-center justify-center bg-[#FAFBFA] z-0 pt-2 rounded-b-3xl">
         <span className="text-gray-400 text-lg font-bold tracking-wide uppercase text-sm mb-1">{days[nextDate.getDay()]}</span>
         <span className="text-[var(--ink)] text-8xl font-display font-bold tabular-nums leading-none">
           {nextDate.getDate()}
         </span>
       </div>

       {/* Top Layer: Flipping Current Date */}
       <div 
         key={flipKey} 
         className="absolute top-14 left-0 w-full h-[calc(100%-3.5rem)] flex flex-col items-center justify-center bg-white border-b-2 border-gray-200 shadow-sm z-10 pt-2 calendar-flip-page rounded-b-3xl origin-top"
       >
         <span className="text-gray-400 text-lg font-bold tracking-wide uppercase text-sm mb-1">{days[currentDate.getDay()]}</span>
         <span className="text-[var(--ink)] text-8xl font-display font-bold tabular-nums leading-none">
           {currentDate.getDate()}
         </span>
         
         <div className="absolute inset-0 bg-gradient-to-t from-gray-100 to-transparent opacity-50 rounded-b-3xl pointer-events-none"></div>
       </div>
    </div>
  );
}
