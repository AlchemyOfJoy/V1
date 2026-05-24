"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

interface Coach {
  id: string;
  email: string;
  name: string | null;
  cert_status: string | null;
  accepting_clients: boolean | null;
  capacity: number | null;
}

const PHASES = [
  { id: "phase_1_client", label: "1 · Be a client" },
  { id: "phase_2_study", label: "2 · Study" },
  { id: "phase_3_practice", label: "3 · Practice" },
  { id: "phase_4_supervised", label: "4 · Supervised" },
  { id: "phase_5_interview", label: "5 · Final interview" },
  { id: "certified", label: "✓ Certified" },
  { id: "inactive", label: "Inactive" },
];

export default function CoachAdmin({
  initialCoaches,
}: {
  initialCoaches: Coach[];
}) {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function promote(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't promote.");
      setMsg(`${email} promoted to coach.`);
      setEmail("");
      router.refresh();
      const list = await fetch("/api/admin/coaches")
        .then((r) => r.json())
        .catch(() => ({ coaches: [] }));
      setCoaches(list.coaches ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function update(
    coachId: string,
    patch: { cert_status?: string; accepting_clients?: boolean; capacity?: number },
  ) {
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/coaches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coach_id: coachId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't update.");
      setCoaches((cur) =>
        cur.map((c) =>
          c.id === coachId
            ? {
                ...c,
                cert_status: patch.cert_status ?? c.cert_status,
                accepting_clients:
                  patch.accepting_clients ?? c.accepting_clients,
                capacity: patch.capacity ?? c.capacity,
              }
            : c,
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-navy/12 bg-white p-5">
        <h2 className="font-serif text-[20px] font-medium text-navy">
          Promote a user to coach
        </h2>
        <p className="mt-1 font-sans text-[13px] font-light text-navy/55">
          They must have already signed up. They&apos;ll see the Coach
          Portal link in the header on next sign-in.
        </p>
        <form onSubmit={promote} className="mt-4 flex flex-wrap gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
            required
            className="flex-1 rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-sans text-[15px] text-navy outline-none transition focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25"
          />
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className={btnPrimary}
          >
            {busy ? "…" : "Promote"}
          </button>
        </form>
        {msg && (
          <p className="mt-3 font-sans text-[13px] text-cyan-deep">{msg}</p>
        )}
        {error && (
          <p className="mt-3 font-sans text-[13px] text-[#8a6d00]">{error}</p>
        )}
      </section>

      <section>
        <h2 className="font-serif text-[20px] font-medium text-navy">
          All coaches{" "}
          <span className="ml-2 font-sans text-[13px] font-light text-navy/45">
            {coaches.length}
          </span>
        </h2>

        {coaches.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center font-sans text-[13px] font-light text-navy/55">
            No coaches yet. Promote your first one above.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {coaches.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-navy/10 bg-white p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-serif text-[18px] font-medium text-navy">
                      {c.name ?? c.email}
                    </p>
                    {c.name && (
                      <p className="font-sans text-[12px] text-navy/55">
                        {c.email}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      c.cert_status === "certified"
                        ? "bg-cyan-deep/15 text-cyan-deep"
                        : "bg-mist text-navy/55"
                    }`}
                  >
                    {c.cert_status === "certified"
                      ? "Certified"
                      : "In training"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
                      Phase
                    </span>
                    <select
                      value={c.cert_status ?? "phase_1_client"}
                      onChange={(e) =>
                        update(c.id, { cert_status: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 font-sans text-[13px] text-navy outline-none focus:border-cyan-deep"
                    >
                      {PHASES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-end gap-3">
                    <input
                      type="checkbox"
                      checked={c.accepting_clients ?? false}
                      onChange={(e) =>
                        update(c.id, { accepting_clients: e.target.checked })
                      }
                      className="h-4 w-4 accent-cyan-deep"
                      disabled={c.cert_status !== "certified"}
                    />
                    <span className="font-sans text-[13px] text-navy">
                      Accepting new clients
                      {c.cert_status !== "certified" && (
                        <span className="ml-2 font-sans text-[11px] text-navy/45">
                          (cert first)
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
