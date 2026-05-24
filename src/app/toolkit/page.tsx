import type { Metadata } from "next";
import ToolkitBrowser from "@/components/toolkit/ToolkitBrowser";

export const metadata: Metadata = {
  title: "Tool Kit",
  robots: { index: false },
};

export default function ToolkitPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-8 sm:py-12">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Tool Kit · 20 tools
        </p>
        <h1 className="mt-3 font-serif text-[38px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          The arrows in your <em className="text-cyan-deep">quiver</em>
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-[16px] font-light leading-relaxed text-navy/65">
          Twenty tools, accessible any time. Some are full interactive
          flows; others are reference cards until the interactive version
          ships.
        </p>
      </header>
      <ToolkitBrowser />
    </div>
  );
}
