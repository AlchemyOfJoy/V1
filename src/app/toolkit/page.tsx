import type { Metadata } from "next";
import ToolkitBrowser from "@/components/toolkit/ToolkitBrowser";

export const metadata: Metadata = {
  title: "Tool Kit",
  robots: { index: false },
};

export default function ToolkitPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 pb-12 pt-6 sm:pt-10">
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Tool Kit · 20
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-navy sm:text-[40px]">
          Arrows in your <em className="text-cyan-deep">quiver</em>
        </h1>
      </header>
      <ToolkitBrowser />
    </div>
  );
}
