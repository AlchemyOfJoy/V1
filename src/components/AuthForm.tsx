"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

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
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push(isSignup ? "/assessment" : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 outline-none transition focus:bg-white focus:ring-2 focus:ring-accent/45";

  return (
    <div className="w-full max-w-[360px]">
      <h1 className="text-[26px] font-semibold tracking-tight text-ink">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-[15px] text-ink-2">
        {isSignup
          ? "Start tracking your joy today."
          : "Sign in to continue your joy journey."}
      </p>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-2.5">
        {isSignup && (
          <input
            type="text"
            placeholder="First name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        )}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
        <input
          type="password"
          required
          placeholder={isSignup ? "Password (8+ characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
        <button
          type="submit"
          disabled={loading}
          className="!mt-4 w-full rounded-xl bg-accent py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-55"
        >
          {loading
            ? "Please wait…"
            : isSignup
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-5 flex items-center gap-3 text-[12px] text-ink-3">
            <span className="h-px flex-1 bg-hairline" />
            or
            <span className="h-px flex-1 bg-hairline" />
          </div>
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-hairline bg-white py-3 text-[15px] font-medium text-ink transition-colors hover:bg-canvas"
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

      <p className="mt-6 text-[13px] text-ink-2">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
