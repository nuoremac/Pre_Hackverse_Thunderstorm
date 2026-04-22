import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function TermsPage() {
  return (
    <div className="bg-[#FAFBFA] min-h-screen font-sans">
      <SiteHeader />
      <main className="section-shell pt-24 pb-32 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-10">Terms of Service</h1>
        <article className="prose prose-lg text-[var(--muted)]">
          <p className="mb-6">Welcome to OptiTime. By substituting "PulsePlan" with "OptiTime", we affirm our commitment to delivering you the best automated planning layer available.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-10 mb-4">1. Use of the Services</h2>
          <p className="mb-6">You must follow any policies made available to you within the Services. Don't misuse our Services. For example, don't interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-10 mb-4">2. Your Account</h2>
          <p className="mb-6">You may need an OptiTime Account in order to use some of our Services. You may create your own OptiTime Account, or your OptiTime Account may be assigned to you by an administrator.</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
