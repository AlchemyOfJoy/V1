import type { Metadata } from "next";
import ComingSoonStub from "@/components/curriculum/ComingSoonStub";

export const metadata: Metadata = {
  title: "Self Eulogy",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoonStub
      eyebrow="Module 2 · Self Eulogy"
      title={
        <>
          Self <em className="text-cyan-deep">Eulogy</em>
        </>
      }
      subtitle="Write the eulogy you want spoken about you. Reverse-engineer the life that earns it."
      whatItIs="Imagine the person you love most reading your eulogy. What do you want them to say? This exercise pulls you out of the daily grind to see the full arc of your life."
      howToDoIt="Use the nine guiding prompts as a sidebar (how you wanted to make people feel, what qualities you embodied, the impact you had). Then write — one long-form piece. No character limit. Save and return any time."
      whereInBook="p. 20"
    />
  );
}
