import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "The List of Joy™",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Module 2 · The List of Joy™"
      title={
        <>
          The List of <em className="text-cyan-deep">Joy</em>™
        </>
      }
      subtitle="A living list of what brings you joy — the raw material for everything that follows."
      whatItIs="A running document of everything that brings you real joy — from the small (warm sun on your face, the first sip of morning coffee) to the large (lifelong dreams, the people you love most)."
      howToDoIt="Add items any time, from anywhere in the app. Tag each one later with a Priority Pillar. This list becomes the seed for your SubScript manifestations."
      whereInBook="p. 26"
    />
  );
}
