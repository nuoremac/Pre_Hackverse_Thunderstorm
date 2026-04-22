"use client";

import { useState } from "react";
import { 
  Mail, 
  Settings, 
  ShieldCheck, 
  Lock, 
  UserPlus, 
  Key, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

export default function EmailsSettingsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "smtp">("templates");

  return (
    <div className="p-8 md:p-10 max-w-[1000px] mx-auto h-full flex flex-col font-sans reveal-up">
      
      {/* Description & Sub-tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="max-w-xl">
           <p className="text-[var(--muted)] text-sm leading-relaxed">
            Configure what emails your users receive and how they are sent. You can customize templates for authentication and security events, or set up a custom SMTP provider for production use.
          </p>
        </div>
        <div className="flex bg-gray-100/80 p-1 rounded-xl border border-[var(--line)]">
           <button 
            onClick={() => setActiveTab("templates")}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "templates" ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
           >
             Templates
           </button>
           <button 
            onClick={() => setActiveTab("smtp")}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "smtp" ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
           >
             SMTP Settings
           </button>
        </div>
      </div>

      {activeTab === "templates" ? (
        <TemplateView />
      ) : (
        <SMTPView />
      )}

      {/* Footer Actions */}
      <div className="mt-12 pt-8 border-t border-[var(--line)] flex justify-end gap-3">
         <button className="px-6 py-2.5 bg-gray-50 text-[var(--muted)] font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">Discard</button>
         <button className="btn-primary !px-8 !py-2.5 !text-sm rounded-xl">Save Changes</button>
      </div>
    </div>
  );
}

function TemplateView() {
  return (
    <div className="space-y-12 pb-10">
      
      {/* Authentication Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
            <Lock className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--ink)]">Authentication</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TemplateCard 
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
            title="Confirm sign up" 
            description="Ask users to confirm their email address after signing up" 
            enabled={true}
          />
          <TemplateCard 
            icon={<UserPlus className="w-4 h-4 text-blue-500" />}
            title="Invite user" 
            description="Invite users who don't yet have an account to sign up" 
            enabled={true}
          />
          <TemplateCard 
            icon={<Key className="w-4 h-4 text-orange-500" />}
            title="Magic link" 
            description="Allow users to sign in via a one-time link sent to their email" 
            enabled={true}
          />
          <TemplateCard 
            icon={<RefreshCw className="w-4 h-4 text-purple-500" />}
            title="Change email address" 
            description="Ask users to verify their new email address after changing it" 
            enabled={true}
          />
          <TemplateCard 
            icon={<AlertCircle className="w-4 h-4 text-red-500" />}
            title="Reset password" 
            description="Allow users to reset their password if they forget it" 
            enabled={true}
          />
          <TemplateCard 
            icon={<ShieldCheck className="w-4 h-4 text-indigo-500" />}
            title="Reauthentication" 
            description="Ask users to re-authenticate before performing a sensitive action" 
            enabled={false}
          />
        </div>
      </section>

      {/* Security Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-lg font-bold text-[var(--ink)]">Security</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TemplateCard title="Password changed" description="Notify users when their password has changed" enabled={true} />
          <TemplateCard title="Email address changed" description="Notify users when their email address has changed" enabled={true} />
          <TemplateCard title="Phone number changed" description="Notify users when their phone number has changed" enabled={true} />
          <TemplateCard title="Identity linked" description="Notify users when a new identity has been linked" enabled={true} />
          <TemplateCard title="Identity unlinked" description="Notify users when an identity has been unlinked" enabled={true} />
          <TemplateCard title="MFA method added" description="Notify users when a new MFA method is added" enabled={true} />
          <TemplateCard title="MFA method removed" description="Notify users when an MFA method is removed" enabled={true} />
        </div>
      </section>
    </div>
  );
}

function SMTPView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Warning Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900">Custom SMTP Recommendation</h4>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            You’re currently using the built-in email service. This service has <strong>strict rate limits</strong> and is not recommended for production applications. Set up a custom SMTP provider like SendGrid, Resend, or AWS SES to ensure reliable delivery.
          </p>
          <button className="mt-3 text-xs font-bold text-amber-900 flex items-center gap-1 hover:underline">
            Learn more about email limits <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* SMTP Form Card */}
      <div className="bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[var(--muted)]" />
            <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider">SMTP Configuration</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-500 uppercase tracking-tighter">Disabled</span>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">SMTP Host</label>
              <input type="text" placeholder="smtp.provider.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Port Number</label>
              <input type="text" placeholder="587" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Username</label>
              <input type="text" placeholder="apikey or user@domain.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
              <input type="password" placeholder="••••••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] transition-all" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded text-[var(--accent)]" id="smtp-enabled" />
                <label htmlFor="smtp-enabled" className="text-sm font-semibold text-[var(--ink)] cursor-pointer">Enable custom SMTP</label>
             </div>
             <button className="flex items-center gap-2 text-xs font-bold text-[var(--accent-dark)] bg-[var(--accent-soft)] px-4 py-2 rounded-lg hover:bg-[rgba(21,184,106,0.15)] transition-all">
               Test Connection
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}

function TemplateCard({ icon, title, description, enabled }: TemplateCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-[var(--line)] p-5 hover:border-[var(--accent-dark)] hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-soft)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex gap-4">
          {icon && (
            <div className="mt-1 w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
          <div className={!icon ? "pt-1" : ""}>
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              {title}
              {enabled ? (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Enabled" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" title="Disabled" />
              )}
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="self-center">
           <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[var(--accent-dark)] group-hover:text-white transition-all shadow-sm">
             <ChevronRight className="w-4 h-4" />
           </div>
        </div>
      </div>
    </div>
  );
}
