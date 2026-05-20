import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import QuizClient from "@/components/QuizClient";

export default async function AssessmentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-amber-950">
            JQ Assessment
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            For each question, choose the number that best reflects your
            current experience in life. Be honest — this is for you.
          </p>
        </div>
        <QuizClient />
      </main>
    </>
  );
}
