"use client";

import Link from "next/link";
import { useState } from "react";
import { btnPrimary } from "@/lib/ui";

const label =
  "mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55";
const field =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition duration-150 placeholder:text-navy/35 focus:border-cyan focus:ring-2 focus:ring-cyan/25";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something didn't work — try again?");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Something didn't work — check your connection and try again?");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-[380px] animate-fade-in">
        <h1 className="font-serif text-[30px] font-medium leading-tight tracking-tight text-navy">
          Check your <em className="text-cyan-deep">email</em>.
        </h1>
        <p className="mt-3 font-serif text-[16px] italic leading-relaxed text-navy/65">
          If an account exists for{" "}
          <span className="not-italic text-navy">{email}</span>, a reset
          link is on its way. It expires in an hour.
        </p>
        <p className="mt-4 font-sans text-[13px] text-navy/55">
          Didn&apos;t get it? Check spam, then{" "}
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setLoading(false);
            }}
            className="font-medium text-navy underline decoration-navy/30 underline-offset-2 hover:text-cyan-deep"
          >
            try again
          </button>
          .
        </p>
        <p className="mt-8 font-sans text-[13px] text-navy/55">
          <Link
            href="/login"
            className="font-medium text-navy underline decoration-navy/30 underline-offset-2 hover:text-cyan-deep"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[380px] animate-fade-in">
      <h1 className="font-serif text-[30px] font-medium leading-tight tracking-tight text-navy">
        Forgot your <em className="text-cyan-deep">password</em>?
      </h1>
      <p className="mt-2 font-sans text-[15px] font-light text-navy/60">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-gold/45 bg-gold/12 px-4 py-3 font-sans text-[13px] text-[#8a6d00]">
          <span aria-hidden>✦</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className={`${btnPrimary} !mt-7 w-full`}
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-7 font-sans text-[13px] text-navy/60">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-navy underline decoration-navy/30 underline-offset-2 hover:text-cyan-deep"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
