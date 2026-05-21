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
      <main className="mx-auto max-w-xl px-6 py-16">
        <QuizClient />
      </main>
    </>
  );
}
