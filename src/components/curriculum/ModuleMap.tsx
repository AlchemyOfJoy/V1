import Link from "next/link";
import { MODULES, SECONDARY_DESTS } from "@/lib/curriculum";

/**
 * The workbook-style numbered map of the four Modules + secondary
 * destinations. Available items are fully clickable; coming-soon items
 * link to stub pages so the IA stays navigable.
 */
export default function ModuleMap() {
  return (
    <div className="space-y-6">
      <ol className="grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => (
          <li key={m.id}>
            <Link
              href={`/curriculum/module/${m.slug}`}
              className="flex h-full items-start gap-5 rounded-2xl border border-navy/12 bg-white p-6 transition hover:border-cyan-deep/40"
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-serif text-[26px] font-medium ${
                  m.status === "available"
                    ? "bg-cyan-deep text-white"
                    : "bg-mist text-navy/55"
                }`}
              >
                {m.number}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-[20px] font-medium leading-tight text-navy">
                    {m.title}
                  </h3>
                  {m.status === "coming-soon" && (
                    <span className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/45">
                      In development
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-sans text-[13px] font-light leading-relaxed text-navy/65">
                  {m.subtitle}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <ul className="grid gap-3 sm:grid-cols-2">
        {SECONDARY_DESTS.map((d) => (
          <li key={d.id}>
            <Link
              href={`/curriculum/${d.slug}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-mist px-5 py-4 transition hover:bg-[#ebf0f4]"
            >
              <div className="min-w-0">
                <div className="font-serif text-[17px] font-medium text-navy">
                  {d.title}
                </div>
                <div className="truncate font-sans text-[12px] font-light text-navy/60">
                  {d.subtitle}
                </div>
              </div>
              {d.status === "coming-soon" && (
                <span className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/45">
                  Soon
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
