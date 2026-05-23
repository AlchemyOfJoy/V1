import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "Priority Pillars",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Module 2 · Priority Pillars"
      title={
        <>
          Priority <em className="text-cyan-deep">Pillars</em>
        </>
      }
      subtitle="Take inventory of the 12 sub-pillars holding up your life. Notice what's depleted."
      whatItIs="Six pillars — Love, Faith, Health, Family, Career, Community — each with two sub-pillars. When even one is depleted, you feel it everywhere. This inventory makes the invisible visible."
      howToDoIt="Rate each of the 12 sub-pillars from 1–10. Don't overthink it; trust your first answer. We'll surface which pillar is asking for attention and link you to the next step that addresses it."
      whereInBook="p. 29"
    />
  );
}
