"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-navy/55";

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save.");
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          disabled
          className={`${inputClass} mt-2 opacity-60`}
        />
        <p className="mt-1 font-sans text-[11px] text-navy/50">
          Email changes aren&apos;t supported yet. Contact us if you need
          to update it.
        </p>
      </div>
      <div>
        <label className={labelClass} htmlFor="name">
          Display name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} mt-2`}
          maxLength={120}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[13px] text-cyan-deep">{msg}</p>
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
        <button type="submit" className={btnPrimary} disabled={busy}>
          {busy ? "…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't update.");
      setMsg("Password updated.");
      setCurrent("");
      setNext("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      {hasPassword && (
        <div>
          <label className={labelClass} htmlFor="current">
            Current password
          </label>
          <input
            id="current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className={`${inputClass} mt-2`}
          />
        </div>
      )}
      <div>
        <label className={labelClass} htmlFor="next">
          {hasPassword ? "New password" : "Set a password"}
        </label>
        <input
          id="next"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          minLength={8}
          placeholder="At least 8 characters"
          className={`${inputClass} mt-2`}
        />
        {!hasPassword && (
          <p className="mt-1 font-sans text-[11px] text-navy/50">
            You signed in with Google. Setting a password lets you sign in
            with email + password too.
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[13px] text-cyan-deep">{msg}</p>
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
        <button type="submit" className={btnPrimary} disabled={busy}>
          {busy ? "…" : hasPassword ? "Change password" : "Set password"}
        </button>
      </div>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function destroy(e: React.FormEvent) {
    e.preventDefault();
    if (
      !window.confirm(
        "Delete your account and ALL your data? This cannot be undone.",
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't delete.");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={destroy} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="confirm-email">
          Type your email to confirm
        </label>
        <input
          id="confirm-email"
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={email}
          className={`${inputClass} mt-2`}
          required
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
        <button
          type="submit"
          disabled={busy || confirm !== email}
          className="rounded-full bg-[#8a6d00] px-5 py-2.5 font-sans text-[13px] font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
        >
          {busy ? "…" : "Delete account permanently"}
        </button>
      </div>
    </form>
  );
}
