import type { Metadata } from "next";
import Onboarding from "@/components/curriculum/Onboarding";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false },
};

export default function OnboardingPage() {
  return <Onboarding />;
}
