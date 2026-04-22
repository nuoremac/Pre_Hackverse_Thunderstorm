import Link from "next/link";

type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PagePlaceholder({
  eyebrow,
  title,
  description
}: PagePlaceholderProps) {
  return (
    <main className="grid-overlay min-h-screen">
      <section className="section-shell">
        <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center">
          <div className="panel-card w-full px-8 py-10 md:px-12 md:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-dark)]">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold tracking-[-0.06em] text-[var(--ink)] md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link className="btn-primary" href="/">
                Back to landing page
              </Link>
              <Link className="btn-secondary" href="/planner">
                Keep shaping the product
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
