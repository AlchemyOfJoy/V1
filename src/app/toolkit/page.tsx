import type { Metadata } from "next";
import ToolkitBrowser from "@/components/toolkit/ToolkitBrowser";
import TeachingMoment from "@/components/app/TeachingMoment";
import { getCurrentUser } from "@/lib/auth";
import { getTutorialFlags } from "@/lib/tutorial-flags";

export const metadata: Metadata = {
  title: "Tool Kit",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ToolkitPage() {
  const user = (await getCurrentUser())!;
  const flags = await getTutorialFlags(user.id);
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
      <TeachingMoment
        flag="first_tool_tap"
        copy="Tools live here. Use them any time."
        alreadySeen={flags.first_tool_tap}
      />
      <ToolkitBrowser />
    </div>
  );
}
