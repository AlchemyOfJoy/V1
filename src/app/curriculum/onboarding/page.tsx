import type { Metadata } from "next";
import OnboardingTutorial from "@/components/onboarding/OnboardingTutorial";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false },
};

export default function OnboardingPage() {
  return <OnboardingTutorial />;
}
