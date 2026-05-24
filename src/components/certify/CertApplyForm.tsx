"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";
import { CERT_PROGRAM_PRICE_CENTS, formatPrice } from "@/lib/pricing";

const textareaClass =
  "w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-3 font-sans text-[15px] leading-relaxed text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55";

export default function CertApplyForm() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [experience, setExperience] = useState("");
  const [whyAoj, setWhyAoj] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"form" | "pay" | "done">("form");
  const [applicationId, setApplicationId] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/certification/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: story.trim(),
          experience: experience.trim(),
          why_aoj: whyAoj.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't submit.");
      setApplicationId(data.application.id);
      setStage("pay");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function mockPay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/certification/apply", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          action: "mock_pay",
        }),
      });
      if (!res.ok) throw new Error();
      setStage("done");
      router.refresh();
    } catch {
      setError("Couldn't complete — try again.");
    } finally {
      setBusy(false);
    }
  }

  if (stage === "done") {
    return (
      <div className="rounded-3xl border border-cyan-deep/40 bg-gradient-to-br from-mist to-white p-8 text-center">
        <p aria-hidden className="text-[28px] text-gold">
          ✦
        </p>
        <h3 className="mt-2 font-serif text-[24px] font-medium text-navy">
          Application received.
        </h3>
        <p className="mt-2 font-sans text-[14px] font-light leading-relaxed text-navy/70">
          Brent personally reviews every cert application. You&apos;ll
          hear back within five business days. When approved,
          you&apos;ll be promoted to coach role and start at Phase 1.
        </p>
      </div>
    );
  }

  if (stage === "pay") {
    return (
      <div className="rounded-3xl border border-cyan-deep/40 bg-white p-8">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-deep">
          Application received
        </p>
        <h3 className="mt-2 font-serif text-[26px] font-medium text-navy">
          One last step.
        </h3>
        <p className="mt-3 font-sans text-[15px] font-light leading-relaxed text-navy/70">
          Pay the {formatPrice(CERT_PROGRAM_PRICE_CENTS)} program fee to
          enter Phase 1. Once Brent reviews and approves, you&apos;ll be
          promoted to coach role and the journey begins.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={mockPay} disabled={busy} className={btnPrimary}>
            {busy ? "…" : `Pay ${formatPrice(CERT_PROGRAM_PRICE_CENTS)} (placeholder)`}
          </button>
          <p className="self-center font-sans text-[12px] italic text-navy/45">
            Real Stripe Checkout wires in once Connect is approved.
          </p>
        </div>
        {error && (
          <p className="mt-3 font-sans text-[13px] text-[#8a6d00]">{error}</p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-3xl border border-navy/12 bg-white p-6 sm:p-8"
    >
      <div>
        <label htmlFor="story" className={labelClass}>
          Your story — what brought you here
        </label>
        <textarea
          id="story"
          rows={6}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          required
          maxLength={8000}
          placeholder="The arc of your own life — what made the AOJ methodology land. We're not looking for credentials; we're looking for lived truth."
          className={`${textareaClass} mt-2`}
        />
      </div>

      <div>
        <label htmlFor="experience" className={labelClass}>
          Coaching / facilitation experience
        </label>
        <textarea
          id="experience"
          rows={5}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          required
          maxLength={8000}
          placeholder="Anything you've done that involved holding space for other people's growth — formal training, informal practice, retreats, peer work."
          className={`${textareaClass} mt-2`}
        />
      </div>

      <div>
        <label htmlFor="why-aoj" className={labelClass}>
          Why AOJ — why now
        </label>
        <textarea
          id="why-aoj"
          rows={5}
          value={whyAoj}
          onChange={(e) => setWhyAoj(e.target.value)}
          required
          maxLength={8000}
          placeholder="What about this methodology in particular? Why this work at this point in your life?"
          className={`${textareaClass} mt-2`}
        />
      </div>

      <div className="rounded-2xl border border-gold/30 bg-[#fdf6e0] p-4 font-sans text-[13px] font-light leading-relaxed text-navy/75">
        <p className="font-semibold text-[#8a6d00]">
          Cert program fee: {formatPrice(CERT_PROGRAM_PRICE_CENTS)}
        </p>
        <p className="mt-1">
          One-time. Covers all five phases — Be a Client → Study →
          Practice → Supervised → Final Interview with Brent. Payment
          collected after you submit.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[12px] text-[#8a6d00]">{error}</p>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
