"use client";

import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Key,
  Lock,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";

type TemplateItem = {
  title: string;
  description: string;
  enabled: boolean;
  icon?: ReactNode;
};

export default function EmailsSettingsPage() {
  const { locale } = useI18n();
  const [activeTab, setActiveTab] = useState<"templates" | "smtp">("templates");
  const copy =
    locale === "fr"
      ? {
          description:
            "Configurez les emails reçus par vos utilisateurs et la manière dont ils sont envoyés. Vous pouvez personnaliser les modèles pour l’authentification et les événements de sécurité, ou configurer un fournisseur SMTP pour la production.",
          templates: "Modèles",
          smtp: "Paramètres SMTP",
          discard: "Annuler",
          saveChanges: "Enregistrer les modifications",
          authentication: "Authentification",
          security: "Sécurité",
          customSmtpRecommendation: "Recommandation SMTP personnalisée",
          smtpWarning:
            "Vous utilisez actuellement le service email intégré. Ce service a des limites strictes et n’est pas recommandé pour une application en production. Configurez un fournisseur SMTP comme SendGrid, Resend ou AWS SES pour garantir une livraison fiable.",
          learnMore: "En savoir plus sur les limites email",
          smtpConfiguration: "Configuration SMTP",
          disabled: "Désactivé",
          smtpHost: "Hôte SMTP",
          portNumber: "Port",
          username: "Nom d’utilisateur",
          password: "Mot de passe",
          enableCustomSmtp: "Activer le SMTP personnalisé",
          testConnection: "Tester la connexion",
          templatesList: [
            {
              title: "Confirmer l’inscription",
              description: "Demander aux utilisateurs de confirmer leur adresse email après l’inscription",
              enabled: true,
              icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
            },
            {
              title: "Inviter un utilisateur",
              description: "Inviter des utilisateurs qui n’ont pas encore de compte à s’inscrire",
              enabled: true,
              icon: <UserPlus className="w-4 h-4 text-blue-500" />
            },
            {
              title: "Lien magique",
              description: "Permettre une connexion via un lien unique envoyé par email",
              enabled: true,
              icon: <Key className="w-4 h-4 text-orange-500" />
            },
            {
              title: "Changer d’adresse email",
              description: "Demander aux utilisateurs de vérifier leur nouvelle adresse email après modification",
              enabled: true,
              icon: <RefreshCw className="w-4 h-4 text-purple-500" />
            },
            {
              title: "Réinitialiser le mot de passe",
              description: "Permettre aux utilisateurs de réinitialiser leur mot de passe s’ils l’ont oublié",
              enabled: true,
              icon: <AlertCircle className="w-4 h-4 text-red-500" />
            },
            {
              title: "Réauthentification",
              description: "Demander une réauthentification avant une action sensible",
              enabled: false,
              icon: <ShieldCheck className="w-4 h-4 text-indigo-500" />
            }
          ],
          securityList: [
            { title: "Mot de passe modifié", description: "Notifier les utilisateurs lorsqu’un mot de passe change", enabled: true },
            { title: "Adresse email modifiée", description: "Notifier les utilisateurs lorsqu’une adresse email change", enabled: true },
            { title: "Numéro de téléphone modifié", description: "Notifier les utilisateurs lorsqu’un numéro change", enabled: true },
            { title: "Identité liée", description: "Notifier lorsqu’une nouvelle identité est liée", enabled: true },
            { title: "Identité dissociée", description: "Notifier lorsqu’une identité est dissociée", enabled: true },
            { title: "Méthode MFA ajoutée", description: "Notifier lorsqu’une méthode MFA est ajoutée", enabled: true },
            { title: "Méthode MFA retirée", description: "Notifier lorsqu’une méthode MFA est supprimée", enabled: true }
          ]
        }
      : {
          description:
            "Configure what emails your users receive and how they are sent. You can customize templates for authentication and security events, or set up a custom SMTP provider for production use.",
          templates: "Templates",
          smtp: "SMTP Settings",
          discard: "Discard",
          saveChanges: "Save Changes",
          authentication: "Authentication",
          security: "Security",
          customSmtpRecommendation: "Custom SMTP Recommendation",
          smtpWarning:
            "You’re currently using the built-in email service. This service has strict rate limits and is not recommended for production applications. Set up a custom SMTP provider like SendGrid, Resend, or AWS SES to ensure reliable delivery.",
          learnMore: "Learn more about email limits",
          smtpConfiguration: "SMTP Configuration",
          disabled: "Disabled",
          smtpHost: "SMTP Host",
          portNumber: "Port Number",
          username: "Username",
          password: "Password",
          enableCustomSmtp: "Enable custom SMTP",
          testConnection: "Test Connection",
          templatesList: [
            {
              title: "Confirm sign up",
              description: "Ask users to confirm their email address after signing up",
              enabled: true,
              icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
            },
            {
              title: "Invite user",
              description: "Invite users who don't yet have an account to sign up",
              enabled: true,
              icon: <UserPlus className="w-4 h-4 text-blue-500" />
            },
            {
              title: "Magic link",
              description: "Allow users to sign in via a one-time link sent to their email",
              enabled: true,
              icon: <Key className="w-4 h-4 text-orange-500" />
            },
            {
              title: "Change email address",
              description: "Ask users to verify their new email address after changing it",
              enabled: true,
              icon: <RefreshCw className="w-4 h-4 text-purple-500" />
            },
            {
              title: "Reset password",
              description: "Allow users to reset their password if they forget it",
              enabled: true,
              icon: <AlertCircle className="w-4 h-4 text-red-500" />
            },
            {
              title: "Reauthentication",
              description: "Ask users to re-authenticate before performing a sensitive action",
              enabled: false,
              icon: <ShieldCheck className="w-4 h-4 text-indigo-500" />
            }
          ],
          securityList: [
            { title: "Password changed", description: "Notify users when their password has changed", enabled: true },
            { title: "Email address changed", description: "Notify users when their email address has changed", enabled: true },
            { title: "Phone number changed", description: "Notify users when their phone number has changed", enabled: true },
            { title: "Identity linked", description: "Notify users when a new identity has been linked", enabled: true },
            { title: "Identity unlinked", description: "Notify users when an identity has been unlinked", enabled: true },
            { title: "MFA method added", description: "Notify users when a new MFA method is added", enabled: true },
            { title: "MFA method removed", description: "Notify users when an MFA method is removed", enabled: true }
          ]
        };

  return (
    <div className="mx-auto flex h-full max-w-[1000px] flex-col px-8 py-8 md:px-10">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl">
          <p className="text-sm leading-relaxed text-[var(--muted)]">{copy.description}</p>
        </div>

        <div className="flex rounded-xl border border-[var(--line)] bg-white/80 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`px-5 py-2 text-xs font-bold transition-all ${
              activeTab === "templates" ? "rounded-lg bg-[var(--ink)] text-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {copy.templates}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("smtp")}
            className={`px-5 py-2 text-xs font-bold transition-all ${
              activeTab === "smtp" ? "rounded-lg bg-[var(--ink)] text-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {copy.smtp}
          </button>
        </div>
      </div>

      {activeTab === "templates" ? (
        <div className="space-y-12 pb-10">
          <TemplateSection
            title={copy.authentication}
            icon={
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                <Lock className="w-4 h-4 text-[var(--accent)]" />
              </div>
            }
            items={copy.templatesList}
          />

          <TemplateSection
            title={copy.security}
            icon={
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
              </div>
            }
            items={copy.securityList}
          />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">{copy.customSmtpRecommendation}</h4>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">{copy.smtpWarning}</p>
              <button className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline">
                {copy.learnMore}
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--line)] bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[var(--muted)]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)]">
                  {copy.smtpConfiguration}
                </h2>
              </div>
              <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-gray-500">
                {copy.disabled}
              </span>
            </div>

            <div className="space-y-6 p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label={copy.smtpHost} placeholder="smtp.provider.com" />
                <Field label={copy.portNumber} placeholder="587" />
                <Field label={copy.username} placeholder="apikey or user@domain.com" />
                <Field label={copy.password} placeholder="••••••••••••" type="password" />
              </div>

              <div className="flex flex-col justify-between gap-4 border-t border-gray-100 pt-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <input id="smtp-enabled" type="checkbox" className="h-4 w-4 rounded text-[var(--accent)]" />
                  <label htmlFor="smtp-enabled" className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
                    {copy.enableCustomSmtp}
                  </label>
                </div>

                <button className="flex items-center gap-2 rounded-lg bg-[var(--accent-soft)] px-4 py-2 text-xs font-bold text-[var(--accent-dark)] transition-all hover:bg-[rgba(21,184,106,0.15)]">
                  {copy.testConnection}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-end gap-3 border-t border-[var(--line)] pt-8">
        <button className="rounded-xl bg-gray-50 px-6 py-2.5 text-sm font-bold text-[var(--muted)] transition-colors hover:bg-gray-100">
          {copy.discard}
        </button>
        <button className="btn-primary !px-8 !py-2.5 !text-sm rounded-xl">{copy.saveChanges}</button>
      </div>
    </div>
  );
}

function TemplateSection({
  title,
  icon,
  items
}: {
  title: string;
  icon: ReactNode;
  items: TemplateItem[];
}) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-[var(--ink)]">{title}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <TemplateCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            enabled={item.enabled}
          />
        ))}
      </div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  type = "text"
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-gray-400">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
      />
    </div>
  );
}

function TemplateCard({ icon, title, description, enabled }: TemplateItem) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-5 transition-all hover:border-[var(--accent-dark)] hover:shadow-md">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent-soft)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex gap-4">
          {icon ? (
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 transition-transform group-hover:scale-110">
              {icon}
            </div>
          ) : null}

          <div className={!icon ? "pt-1" : ""}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
              {title}
              <span
                className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-green-500" : "bg-gray-300"}`}
              />
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{description}</p>
          </div>
        </div>

        <div className="self-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-100 text-gray-400 shadow-sm transition-all group-hover:bg-[var(--accent-dark)] group-hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
