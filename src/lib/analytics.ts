type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a Google Analytics 4 event. Safe no-op when analytics is disabled
 * (no NEXT_PUBLIC_GA_ID) or not yet loaded — never throws.
 */
export function track(event: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params ?? {});
  } catch {
    // Analytics must never break a user flow.
  }
}
