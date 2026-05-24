"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface App {
  id: string;
  email: string;
  name: string | null;
  status: string;
  story: string | null;
  experience: string | null;
  why_aoj: string | null;
  paid_at: string | null;
  created_at: string;
}

export default function CertApplicationsAdmin({
  initial,
}: {
  initial: App[];
}) {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function decide(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/cert-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setApps((cur) => cur.filter((a) => a.id !== id));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (apps.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center font-sans text-[14px] font-light text-navy/55">
        No pending applications.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-2xl border border-[#8a6d00]/30 bg-[#fdf6e0] px-4 py-2 font-sans text-[13px] text-[#8a6d00]">
          {error}
        </p>
      )}
      <ul className="space-y-3">
        {apps.map((a) => {
          const expanded = open === a.id;
          return (
            <li
              key={a.id}
              className="rounded-2xl border border-navy/12 bg-white p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-serif text-[18px] font-medium text-navy">
                    {a.name ?? a.email}
                  </p>
                  {a.name && (
                    <p className="font-sans text-[12px] text-navy/55">
                      {a.email}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      a.status === "paid"
                        ? "bg-cyan-deep/15 text-cyan-deep"
                        : "bg-gold/15 text-[#8a6d00]"
                    }`}
                  >
                    {a.status}
                  </span>
                  <span className="font-sans text-[11px] text-navy/45">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(expanded ? null : a.id)}
                className="mt-2 font-sans text-[12px] font-semibold text-cyan-deep hover:underline"
              >
                {expanded ? "Hide application" : "Read application"}
              </button>

              {expanded && (
                <div className="mt-4 space-y-4 rounded-2xl bg-mist/40 p-4">
                  <Section label="Their story" body={a.story} />
                  <Section label="Coaching experience" body={a.experience} />
                  <Section label="Why AOJ" body={a.why_aoj} />
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => decide(a.id, "approve")}
                  disabled={busyId === a.id}
                  className="rounded-full bg-cyan-deep px-4 py-2 font-sans text-[12px] font-semibold text-white transition hover:bg-[#006a8c] disabled:opacity-50"
                >
                  {busyId === a.id ? "…" : "Approve · promote to coach"}
                </button>
                <button
                  type="button"
                  onClick={() => decide(a.id, "reject")}
                  disabled={busyId === a.id}
                  className="rounded-full border border-[#8a6d00]/30 px-4 py-2 font-sans text-[12px] font-medium text-[#8a6d00] transition hover:bg-[#fdf6e0] disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Section({ label, body }: { label: string; body: string | null }) {
  return (
    <div>
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/55">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-navy">
        {body || <span className="italic text-navy/45">—</span>}
      </p>
    </div>
  );
}
