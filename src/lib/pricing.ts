/**
 * Pricing configuration — placeholders. Edit values here, the rest of
 * the app reads from these constants.
 *
 * Coaching packages: user-facing tiers shown on the upgrade flow.
 * Cert program: what aspiring coaches pay to enter Phase 1.
 *
 * Currency is USD throughout (cents). Convert to display strings via
 * formatPrice(). When Stripe Connect is wired (next turn), each
 * package becomes a Stripe Product + Price; the `id` here is the
 * stable handle the order/subscription tables will reference.
 */

export interface CoachingPackage {
  id: string;
  name: string;
  tagline: string;
  monthlyCents: number;
  includes: string[];
  /** True for the most-recommended tier — gets the visual emphasis. */
  featured?: boolean;
}

export const COACHING_PACKAGES: CoachingPackage[] = [
  {
    id: "anchor",
    name: "Anchor",
    tagline: "Start the work with a coach beside you.",
    monthlyCents: 1_000_00,
    includes: [
      "2 coaching sessions / month",
      "Direct messaging with your coach",
      "Per-item sharing from the app",
      "Quarterly Joy Quotient review",
    ],
  },
  {
    id: "compass",
    name: "Compass",
    tagline: "The most-chosen tier. Coaching plus structured cadence.",
    monthlyCents: 2_500_00,
    featured: true,
    includes: [
      "4 coaching sessions / month",
      "Weekly check-in via the app",
      "Custom assignments from your coach",
      "Monthly Joy Quotient review",
      "Priority response within 24 hours",
    ],
  },
  {
    id: "summit",
    name: "Summit",
    tagline: "Deep partnership. For the season that demands it.",
    monthlyCents: 5_000_00,
    includes: [
      "8 coaching sessions / month",
      "Daily messaging access",
      "Custom assignments + bespoke practices",
      "Quarterly retreat-equivalent intensive (virtual)",
      "Priority same-day response",
      "Direct line to Brent for escalations",
    ],
  },
];

/** What an aspiring coach pays to enter the certification program. */
export const CERT_PROGRAM_PRICE_CENTS = 7_500_00;

export const CERT_PROGRAM_NAME = "AOJ Coach Certification";

export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  if (dollars % 1 === 0) {
    return `$${dollars.toLocaleString()}`;
  }
  return `$${dollars.toFixed(2)}`;
}

export function findPackage(id: string): CoachingPackage | undefined {
  return COACHING_PACKAGES.find((p) => p.id === id);
}
