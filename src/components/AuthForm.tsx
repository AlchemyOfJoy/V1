"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { btnPrimary } from "@/lib/ui";
import { track } from "@/lib/analytics";

export default function AuthForm({
  mode,
  googleEnabled,
  initialError,
}: {
  mode: "login" | "signup";
  googleEnabled: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something didn't work — try again?");
        setLoading(false);
        return;
      }
      track(isSignup ? "sign_up" : "login", { method: "email" });
      // Curriculum is the post-auth home — onboarding redirects new users
      // there automatically; returning users land on the dashboard.
      router.push("/curriculum");
      router.refresh();
    } catch {
      setError("Something didn't work — check your connection and try again?");
      setLoading(false);
    }
  }

  const label =
    "mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55";
  const field =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition duration-150 placeholder:text-navy/35 focus:border-cyan focus:ring-2 focus:ring-cyan/25";

  return (
    <div className="w-full max-w-[380px] animate-fade-in">
      <h1 className="font-serif text-[34px] font-medium leading-tight tracking-tight text-navy">
        {isSignup ? (
          <>
            Create your <em className="text-cyan-deep">account</em>
          </>
        ) : (
          <>
            Welcome <em className="text-cyan-deep">back</em>
          </>
        )}
      </h1>
      <p className="mt-2 font-sans text-[15px] font-light text-navy/60">
        {isSignup
          ? "Start tracking your joy today."
          : "Sign in to continue your joy journey."}
      </p>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-gold/45 bg-gold/12 px-4 py-3 font-sans text-[13px] text-[#8a6d00]">
          <span aria-hidden>✦</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="mt-7 space-y-4">
        {isSignup && (
          <div>
            <label htmlFor="name" className={label}>
              First name{" "}
              <span className="font-normal lowercase">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="password" className={label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder={isSignup ? "At least 8 characters" : ""}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`${btnPrimary} !mt-7 w-full`}
        >
          {loading
            ? "One moment…"
            : isSignup
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-6 flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.18em] text-navy/40">
            <span className="h-px flex-1 bg-navy/12" />
            or
            <span className="h-px flex-1 bg-navy/12" />
          </div>
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-navy/15 bg-white py-3.5 font-sans text-[14px] font-medium text-navy transition duration-150 hover:border-navy/35"
          >
            <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden>
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </a>
        </>
      )}

      <p className="mt-7 font-sans text-[13px] text-navy/60">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-navy underline decoration-navy/30 underline-offset-2 transition-colors duration-150 hover:text-cyan-deep hover:decoration-cyan-deep"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-navy underline decoration-navy/30 underline-offset-2 transition-colors duration-150 hover:text-cyan-deep hover:decoration-cyan-deep"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
