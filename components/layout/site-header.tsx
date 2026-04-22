import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(255,255,255,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <a className="flex items-center gap-3 group" href="#top">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(21,184,106,0.12)] text-[var(--accent-dark)] transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
          </span>
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
              OptiTime
            </p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <Link
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-gray-100 rounded-lg transition-colors"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-gray-100 rounded-lg transition-colors"
            href="/login"
          >
            Sign In
          </Link>
          <Link 
            className="btn-primary !px-6 !py-2.5 !text-sm !rounded-full shadow-md shadow-[rgba(21,184,106,0.2)]" 
            href="/signup"
          >
            Sign Up Free
          </Link>
        </div>
      </div>
    </header>
  );
}
