type SectionHeadingProps = {
  kicker: string;
  title: string;
  description: string;
};

export function SectionHeading({
  kicker,
  title,
  description
}: SectionHeadingProps) {
  return (
    <div className="mx-auto mb-10 max-w-3xl md:mb-14">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-dark)]">
        {kicker}
      </p>
      <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)] md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-[var(--muted)] md:text-lg">
        {description}
      </p>
    </div>
  );
}
