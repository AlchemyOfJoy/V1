import type { Metadata } from "next";
import Link from "next/link";
import { JOURNEY } from "@/lib/itt";

export const metadata: Metadata = {
  title: "Take Bold Action",
  robots: { index: false },
};

const pillar = JOURNEY.find((p) => p.slug === "take-bold-action")!;

export default function TakeBoldActionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-10">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Pillar 3 · Take Bold Action
        </p>
        <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight tracking-tight text-navy sm:text-[48px]">
          Make the install <em className="text-cyan-deep">stick</em>
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
          {pillar.description}
        </p>
      </header>

      <ul className="space-y-3">
        {pillar.sections.map((s) => (
          <li key={s.id}>
            <Link
              href={s.href}
              className="block rounded-2xl border border-navy/12 bg-white p-5 transition hover:border-cyan-deep/40"
            >
              <div className="flex items-baseline justify-between">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                  ~{s.estimatedMin} min
                </p>
              </div>
              <h3 className="mt-1 font-serif text-[20px] font-medium text-navy">
                {s.title.split(s.italicWord)[0]}
                <em className="text-cyan-deep">{s.italicWord}</em>
                {s.title.split(s.italicWord)[1] ?? ""}
              </h3>
              <p className="mt-1 font-sans text-[14px] font-light leading-relaxed text-navy/65">
                {s.oneLiner}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/journey"
        className="block font-sans text-[13px] text-navy/55 hover:text-cyan-deep"
      >
        ← Back to Journey
      </Link>
    </div>
  );
}
