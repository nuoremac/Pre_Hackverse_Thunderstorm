import { LoginPageClient } from "@/app/login/login-page-client";

type SearchParams = Record<string, string | string[] | undefined>;

type LoginPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const authMessage = getAuthMessage(resolvedSearchParams);

  return <LoginPageClient authMessage={authMessage} />;
}

function getAuthMessage(searchParams: SearchParams): string | null {
  const message = firstValue(searchParams.message);
  if (message) return message;

  const error = firstValue(searchParams.error);
  if (error === "supabase_not_configured") return "Supabase is not configured yet.";

  return null;
}

function firstValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

