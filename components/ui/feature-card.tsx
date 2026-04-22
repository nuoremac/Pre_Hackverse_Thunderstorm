type FeatureCardProps = {
  label: string;
  title: string;
  body: string;
};

export function FeatureCard({ label, title, body }: FeatureCardProps) {
  return (
    <article className="panel-card h-full p-7 md:p-8">
      <span className="inline-flex rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </span>
      <h3 className="mt-5 max-w-sm font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
        {title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
        {body}
      </p>
    </article>
  );
}
