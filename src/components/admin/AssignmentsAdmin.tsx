"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

interface User {
  id: string;
  email: string;
  name: string | null;
  coach_id: string | null;
}
interface Coach {
  id: string;
  email: string;
  name: string | null;
}
interface Waitlist {
  id: string;
  email: string;
  package_id: string | null;
  notes: string | null;
  created_at: string;
}

export default function AssignmentsAdmin({
  users,
  coaches,
  waitlist,
}: {
  users: User[];
  coaches: Coach[];
  waitlist: Waitlist[];
}) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function assign(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail.trim(),
          coach_email: coachEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't assign.");
      setMsg(
        coachEmail
          ? `${userEmail} → ${coachEmail}`
          : `${userEmail} returned to BrentBot`,
      );
      setUserEmail("");
      setCoachEmail("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const assignedCount = users.filter((u) => u.coach_id).length;

  return (
    <div className="space-y-10">
      {/* Assign form */}
      <section className="rounded-3xl border border-navy/12 bg-white p-6">
        <h2 className="font-serif text-[20px] font-medium text-navy">
          Pair user with coach
        </h2>
        <p className="mt-1 font-sans text-[13px] font-light text-navy/55">
          Leave coach email blank to return a user to BrentBot.
        </p>
        <form onSubmit={assign} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="user@email.com"
            required
            className="rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-sans text-[14px] text-navy outline-none focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          />
          <input
            type="email"
            value={coachEmail}
            onChange={(e) => setCoachEmail(e.target.value)}
            placeholder="coach@email.com (or blank → BrentBot)"
            className="rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-sans text-[14px] text-navy outline-none focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          />
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? "…" : "Pair"}
          </button>
        </form>
        {msg && (
          <p className="mt-3 font-sans text-[13px] text-cyan-deep">{msg}</p>
        )}
        {error && (
          <p className="mt-3 font-sans text-[13px] text-[#8a6d00]">{error}</p>
        )}
      </section>

      {/* Waitlist */}
      <section>
        <h2 className="font-serif text-[22px] font-medium text-navy">
          Waitlist
          <span className="ml-2 font-sans text-[13px] font-light text-navy/45">
            {waitlist.length}
          </span>
        </h2>
        {waitlist.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-navy/15 bg-white p-6 text-center font-sans text-[13px] font-light text-navy/55">
            Nobody waiting.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {waitlist.map((w) => (
              <li
                key={w.id}
                className="rounded-2xl border border-navy/10 bg-white p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif text-[16px] font-medium text-navy">
                    {w.email}
                  </p>
                  <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-cyan-deep">
                    {w.package_id ?? "no tier"}
                  </p>
                </div>
                {w.notes && (
                  <p className="mt-1 font-sans text-[13px] font-light text-navy/65">
                    {w.notes}
                  </p>
                )}
                <p className="mt-1 font-sans text-[11px] text-navy/45">
                  {new Date(w.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Users" value={users.length} />
        <Stat label="Paired w/ coach" value={assignedCount} />
        <Stat label="Certified coaches" value={coaches.length} />
      </section>

      {/* Available coaches list */}
      {coaches.length > 0 && (
        <section>
          <h2 className="font-serif text-[22px] font-medium text-navy">
            Certified coaches
          </h2>
          <ul className="mt-3 space-y-2">
            {coaches.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-navy/10 bg-white p-4"
              >
                <p className="font-serif text-[16px] font-medium text-navy">
                  {c.name ?? c.email}
                </p>
                <p className="font-sans text-[12px] text-navy/55">{c.email}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4 text-center">
      <p className="font-serif text-[28px] font-medium tabular-nums text-navy">
        {value}
      </p>
      <p className="mt-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {label}
      </p>
    </div>
  );
}
