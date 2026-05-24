"use client";

import Link from "next/link";
import { btnPrimary } from "@/lib/ui";

export default function ExportActions() {
  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className={btnPrimary}
      >
        Print / Save as PDF
      </button>
      <a
        href="/api/curriculum/export"
        className="rounded-full border border-navy/20 px-5 py-2.5 font-sans text-[13px] font-medium text-navy transition hover:border-cyan-deep hover:text-cyan-deep"
      >
        Download JSON
      </a>
      <Link
        href="/curriculum"
        className="self-center font-sans text-[13px] text-navy/55 hover:text-cyan-deep"
      >
        ← Back to curriculum
      </Link>
    </div>
  );
}
