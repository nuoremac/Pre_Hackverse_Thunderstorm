import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PolicyPage() {
  return (
    <div className="bg-[#FAFBFA] min-h-screen font-sans">
      <SiteHeader />
      <main className="section-shell pt-24 pb-32 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-10">Privacy Policy</h1>
        <article className="prose prose-lg text-[var(--muted)]">
          <p className="mb-6">At OptiTime, we take your privacy seriously. We only request the minimum required data to run our advanced scheduling algorithms.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-10 mb-4">1. Data We Collect</h2>
          <p className="mb-6">We collect your calendar availability, task priority signals, and scheduling rules to calculate the best possible times for your focused work.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-10 mb-4">2. Security</h2>
          <p className="mb-6">We use enterprise-grade encryption to secure your tokens. We do not sell your personal data or your task details to third parties.</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
