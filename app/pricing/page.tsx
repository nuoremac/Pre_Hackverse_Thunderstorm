import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CheckCircle2 } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for students managing personal schedules.",
    features: ["Smart priority scoring", "Hard/Soft constraints", "Basic calendar integration", "Up to 50 active tasks"]
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    dark: true,
    description: "For professionals needing to defend deep work.",
    features: ["Unlimited active tasks", "Advanced auto-rescheduling", "Unlimited integrations", "Workload analytics"]
  },
  {
    name: "Teams",
    price: "$29",
    period: "/user/mo",
    description: "For agencies and startup teams managing capacity.",
    features: ["Team workload balancing", "Shared team availability", "Manager dashboards", "Priority support"]
  }
];

export default function PricingPage() {
  return (
    <div className="bg-[#FAFBFA] min-h-screen font-sans">
      <SiteHeader />
      <main className="section-shell pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-[var(--ink)] mb-6">
            Simple, honest pricing.
          </h1>
          <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Choose the plan that suits your scheduling needs. Defend your time starting today.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4">
          {tiers.map((tier) => (
            <div key={tier.name} className={`rounded-3xl p-8 border ${tier.dark ? 'bg-[var(--ink)] text-white border-[var(--ink)] shadow-2xl scale-105' : 'bg-white border-[var(--line)] shadow-sm'}`}>
              <h3 className={`text-2xl font-bold mb-2 ${tier.dark ? 'text-white' : 'text-[var(--ink)]'}`}>{tier.name}</h3>
              <p className={`text-sm mb-6 ${tier.dark ? 'text-gray-300' : 'text-[var(--muted)]'}`}>{tier.description}</p>
              <div className="mb-8">
                <span className={`text-4xl font-display font-bold ${tier.dark ? 'text-white' : 'text-[var(--ink)]'}`}>{tier.price}</span>
                {tier.period && <span className={tier.dark ? 'text-gray-400' : 'text-[var(--muted)]'}>{tier.period}</span>}
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className={`w-5 h-5 ${tier.dark ? 'text-[var(--accent)]' : 'text-[var(--accent-dark)]'}`} />
                    {feat}
                  </li>
                ))}
              </ul>
              <a href="/login" className={`w-full block text-center py-3 rounded-xl font-bold transition-transform hover:scale-105 ${tier.dark ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-[var(--ink)] hover:bg-gray-200'}`}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
