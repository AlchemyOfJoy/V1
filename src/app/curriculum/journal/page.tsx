import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "Journal",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Your words, in one place"
      title={
        <>
          The <em className="text-cyan-deep">Journal</em>
        </>
      }
      subtitle="Every reflection, every breakthrough, every line you've written — searchable and yours."
      whatItIs="A single place to find every reflection you&apos;ve written across the curriculum, plus space for free-form entries any time inspiration lands."
      howToDoIt="Filter by module, by date, or by tag. Write a new entry from any worksheet — or open the journal directly when something needs to come out of you."
    />
  );
}
