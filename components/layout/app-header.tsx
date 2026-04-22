import Link from "next/link";
import Image from "next/image";

const appNavigation = [
  { label: "Home", href: "/" },
  { label: "Planner", href: "/planner" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tasks", href: "/tasks" },
  { label: "Analytics", href: "/analytics" }
];

type AppHeaderProps = {
  actionLabel?: string;
  actionHref?: string;
};

export function AppHeader({
  actionLabel = "Open planner",
  actionHref = "/planner"
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(255,255,255,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link className="flex items-center gap-3" href="/">
          <div className="relative h-10 w-10 overflow-hidden border border-[rgba(21,184,106,0.22)]">
            <Image
              src="/optiTimeLogo.jpeg"
              alt="OptiTime Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-[-0.05em] text-[var(--ink)]">
              OptiTime
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              workspace
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {appNavigation.map((item) => (
            <Link
              key={item.label}
              className="text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="btn-primary !px-5 !py-3 !text-sm" href={actionHref}>
          {actionLabel}
        </Link>
      </div>
    </header>
  );
}
