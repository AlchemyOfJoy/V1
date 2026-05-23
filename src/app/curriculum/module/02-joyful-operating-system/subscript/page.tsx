import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "Subconscious Script",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Module 2 · Subconscious Script"
      title={
        <>
          Subconscious <em className="text-cyan-deep">Script</em>
        </>
      }
      subtitle="Build the SubScript that primes your mind for who you're becoming."
      whatItIs="Your SubScript is the manifesto your mind reads back to you every morning and evening. Anchored in a real memory of joy, written in present tense — the identity you're stepping into, said as if already so."
      howToDoIt="A guided five-step wizard: anchor your Joy Spark, set a target date, list your manifestations and affirmations, then lock it in for printing. Versioned — you can evolve it over time."
      whereInBook="p. 31–36"
    />
  );
}
