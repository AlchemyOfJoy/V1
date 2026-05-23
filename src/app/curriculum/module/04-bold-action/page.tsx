import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "Module 4 — Take Bold Action",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Module 4 · Take Bold Action"
      title={
        <>
          Take Bold <em className="text-cyan-deep">Action</em>
        </>
      }
      subtitle="Ten tools to move from insight to identity. Inner work becomes outer life."
      whatItIs="Ten short, structured exercises — from the Reset Breath that calms your nervous system in seconds, to the 60-Second Shift that turns inspiration into movement before fear catches up."
      howToDoIt="Each tool stands alone — start where you feel pulled. You&apos;ll get a hands-on exercise and a quick reference card you can return to any time. The Toolkit page is already live with all 20 brand tools."
      whereInBook="p. 48–60"
    />
  );
}
