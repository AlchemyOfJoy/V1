"use client";

import { useAccessibility } from "@/components/app/AccessibilityProvider";

/**
 * The "Make it easier on my brain" toggle (§31.1).
 * Persisted per-device in localStorage.
 */
export default function AccessibilityToggle() {
  const { easier, setEasier } = useAccessibility();
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-navy/10 bg-white p-5 transition hover:border-cyan-deep/30">
      <input
        type="checkbox"
        checked={easier}
        onChange={(e) => setEasier(e.target.checked)}
        className="mt-1 h-5 w-5 accent-cyan-deep"
      />
      <div className="min-w-0 flex-1">
        <p className="font-serif text-[18px] font-medium text-navy">
          Make it easier on my brain
        </p>
        <p className="mt-1 font-sans text-[13px] font-light leading-relaxed text-navy/65">
          Switches the body font to a dyslexia-friendly stack, tightens
          line lengths, and disables breath-paced animations. For ADHD,
          dyslexia, or just a quieter screen.
        </p>
      </div>
    </label>
  );
}
