/** Centralised site configuration — single source of truth for
 *  metadata, SEO, sitemaps and absolute-URL generation. */

export const SITE = {
  name: "Joy Quotient Assessment",
  shortName: "Joy Quotient",
  author: "Brent Freeman",
  description:
    "Measure your Joy Quotient (JQ), save your score, and track how your joy grows over time — from The Alchemy of Joy by Brent Freeman.",
} as const;

/** Absolute origin of the deployment, with no trailing slash.
 *  Prefers an explicit env var, then Vercel-provided URLs, then localhost. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}
