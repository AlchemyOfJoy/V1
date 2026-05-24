"use client";

interface Entry {
  id: string;
  body: string;
  title: string | null;
  created_at: string | Date;
}

export default function EntryLog({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="space-y-3">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55">
        Your history — last {entries.length}
      </p>
      <ul className="space-y-2">
        {entries.map((e) => {
          const d = new Date(e.created_at);
          return (
            <li
              key={e.id}
              className="rounded-2xl border border-navy/10 bg-white p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-deep">
                  {d.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                {e.title && (
                  <span className="font-sans text-[12px] text-navy/55">
                    {e.title}
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-navy">
                {e.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
