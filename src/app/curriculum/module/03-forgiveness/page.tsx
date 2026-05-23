import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "Module 3 — Forgiveness Framework",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Module 3 · Forgiveness"
      title={
        <>
          The Forgiveness <em className="text-cyan-deep">Framework</em>
        </>
      }
      subtitle="Release the weight you've been carrying — privately, fully, and on your own terms."
      whatItIs="A four-step private process for releasing the emotional weight of past hurts: Victim Rant → Empath Rave → Universal Meaning → Forgiveness Release."
      howToDoIt="Begin a forgiveness process for one person at a time (use a name, a nickname, or simply &lsquo;someone close to me&rsquo; — even &lsquo;myself&rsquo;). Move through each step in order. Your work stays visible only to you."
      whereInBook="p. 39–46"
    />
  );
}
