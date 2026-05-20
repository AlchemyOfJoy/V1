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
      <main className="mx-auto max-w-xl px-6 py-14">
        <div className="mb-10">
          <h1 className="text-[32px] font-semibold tracking-tight text-ink">
            JQ Assessment
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            For each question, choose the answer that best reflects your
            current experience. Be honest — this is just for you.
          </p>
        </div>
        <QuizClient />
      </main>
    </>
  );
}
