export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  const normalized = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

