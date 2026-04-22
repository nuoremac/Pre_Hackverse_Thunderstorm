const bars = [
  { label: "Mon", value: "72%", width: "w-[72%]" },
  { label: "Tue", value: "86%", width: "w-[86%]" },
  { label: "Wed", value: "54%", width: "w-[54%]" },
  { label: "Thu", value: "61%", width: "w-[61%]" },
  { label: "Fri", value: "34%", width: "w-[34%]" }
];

export function WorkloadPreview() {
  return (
    <div className="panel-card p-7 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Workload preview
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
            Capacity becomes visible before the week breaks.
          </h3>
        </div>
        <div className="rounded-full bg-[var(--secondary-soft)] px-4 py-2 text-sm font-semibold text-[var(--secondary)]">
          Feasibility check enabled
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[var(--muted)]">
              <span>{bar.label}</span>
              <span>{bar.value}</span>
            </div>
            <div className="h-3 rounded-full bg-[rgba(21,24,27,0.08)]">
              <div
                className={`h-3 rounded-full bg-[linear-gradient(90deg,_var(--ink),_var(--accent))] ${bar.width}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-none border border-[var(--line)] bg-white/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Signal
          </p>
          <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
            Thursday is reaching friction.
          </p>
        </div>
        <div className="rounded-none border border-[var(--line)] bg-[var(--accent-soft)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
            Recommendation
          </p>
          <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
            Move one medium-priority task to Friday.
          </p>
        </div>
      </div>
    </div>
  );
}
