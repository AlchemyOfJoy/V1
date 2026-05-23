import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import QuizClient from "@/components/QuizClient";

export const metadata: Metadata = {
  title: "JQ Assessment",
  robots: { index: false },
};

const VALID_CONTEXTS = new Set([
  "baseline",
  "month_1",
  "month_2",
  "month_3",
  "final",
  "ad_hoc",
]);

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { context: raw } = await searchParams;
  const context = raw && VALID_CONTEXTS.has(raw) ? raw : "ad_hoc";

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-xl px-6 py-16">
        <QuizClient context={context} />
      </main>
    </>
  );
}
