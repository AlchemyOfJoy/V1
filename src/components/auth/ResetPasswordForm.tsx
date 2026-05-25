"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnPrimary } from "@/lib/ui";

const label =
  "mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55";
const field =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition duration-150 placeholder:text-navy/35 focus:border-cyan focus:ring-2 focus:ring-cyan/25";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something didn't work — try again?");
        setLoading(false);
        return;
      }
      router.push("/home");
      router.refresh();
    } catch {
      setError("Something didn't work — check your connection and try again?");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[380px] animate-fade-in">
      <h1 className="font-serif text-[30px] font-medium leading-tight tracking-tight text-navy">
        Set a <em className="text-cyan-deep">new password</em>.
      </h1>
      <p className="mt-2 font-sans text-[15px] font-light text-navy/60">
        At least 8 characters. Make it one you&apos;ll remember.
      </p>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-gold/45 bg-gold/12 px-4 py-3 font-sans text-[13px] text-[#8a6d00]">
          <span aria-hidden>✦</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <label htmlFor="password" className={label}>
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            autoFocus
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="confirm" className={label}>
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={field}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className={`${btnPrimary} !mt-7 w-full`}
        >
          {loading ? "Updating…" : "Set new password & sign in"}
        </button>
      </form>

      <p className="mt-4 font-sans text-[12px] text-navy/45">
        For your safety, this will sign you out of every other device.
      </p>
    </div>
  );
}
