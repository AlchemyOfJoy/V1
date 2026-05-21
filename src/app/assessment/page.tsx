import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { eyebrow } from "@/lib/ui";
import SiteHeader from "@/components/SiteHeader";
import QuizClient from "@/components/QuizClient";

export default async function AssessmentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="mb-10">
          <p className={eyebrow}>The Assessment</p>
          <h1 className="mt-3 font-serif text-[38px] font-medium tracking-tight text-navy">
            Measure your <em className="text-cyan">joy</em>
          </h1>
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-navy/65">
            For each question, choose the answer that best reflects your
            current experience. Be honest — this is just for you.
          </p>
        </div>
        <QuizClient />
      </main>
    </>
  );
}
