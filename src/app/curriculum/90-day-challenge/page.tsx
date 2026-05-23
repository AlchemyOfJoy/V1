import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "90-Day Challenge",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Practice · 90 Days"
      title={
        <>
          The 90-Day <em className="text-cyan-deep">Challenge</em>
        </>
      }
      subtitle="Day-by-day practice with weekly focus areas."
      whatItIs="A 12-week structure: a Foundation Week to set the inputs, then four-week arcs to build, deepen, and expand. Each day a small check-in; each week a focus."
      howToDoIt="Begin when you&apos;re ready. Read your SubScript morning and evening. Complete the week&apos;s focus action. Retake your JQ at each monthly checkpoint — watch the data tell you what your soul already knows."
      whereInBook="p. 62"
    />
  );
}
