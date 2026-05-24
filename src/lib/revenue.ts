/**
 * Revenue split — default AOJ 70% / Coach 30%.
 *
 * Override per coach via coach_profiles.revenue_share_coach (added when
 * needed). Until then everything uses the default.
 *
 * Centralizes the math so Stripe Connect payout logic (Phase 3) has
 * one place to read from. Cents in, cents out — never floats.
 */

export const DEFAULT_REVENUE_SHARE = {
  aoj_bps: 7000, // 70.00% in basis points
  coach_bps: 3000, // 30.00%
} as const;

export interface RevenueSplit {
  gross_cents: number;
  aoj_cents: number;
  coach_cents: number;
  aoj_bps: number;
  coach_bps: number;
}

export function splitRevenue(
  grossCents: number,
  coachBps: number = DEFAULT_REVENUE_SHARE.coach_bps,
): RevenueSplit {
  const safeCoachBps = Math.max(0, Math.min(10_000, Math.round(coachBps)));
  const aojBps = 10_000 - safeCoachBps;
  // Floor coach take, residual to AOJ — avoids fractional cent drift.
  const coachCents = Math.floor((grossCents * safeCoachBps) / 10_000);
  const aojCents = grossCents - coachCents;
  return {
    gross_cents: grossCents,
    aoj_cents: aojCents,
    coach_cents: coachCents,
    aoj_bps: aojBps,
    coach_bps: safeCoachBps,
  };
}

/** Display helper: "70 / 30" */
export function formatSplit(coachBps: number): string {
  const coachPct = Math.round(coachBps / 100);
  return `${100 - coachPct} / ${coachPct}`;
}
