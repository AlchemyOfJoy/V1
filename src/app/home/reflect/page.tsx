import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getTodaysIntention,
  getYesterdaysIntention,
} from "@/lib/intentions";
import ReflectionForm from "@/components/home/ReflectionForm";

export const metadata: Metadata = {
  title: "Evening reflection",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * Evening reflection (Synthesis Spec §3.2).
 *
 * Shows the morning's intention back to the user and asks how it
 * landed. "Just a check-in" routes to a Joy Pulse instead.
 *
 * Accepts ?for=yesterday so a user can also close yesterday's loop
 * if they didn't reflect last night.
 */
export default async function ReflectPage({
  searchParams,
}: {
  searchParams: Promise<{ for?: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { for: forParam } = await searchParams;
  const targetYesterday = forParam === "yesterday";
  const intention = targetYesterday
    ? await getYesterdaysIntention(user.id)
    : await getTodaysIntention(user.id);
  if (!intention || !intention.intention) {
    redirect("/home");
  }
  return (
    <main className="mx-auto max-w-2xl px-6 pb-16 pt-10 sm:pt-14">
      <Link
        href="/home"
        className="font-sans text-[12px] text-slate hover:text-cyan"
      >
        ← Home
      </Link>

      <header className="mt-8">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
          Evening reflection
        </p>
        <h1 className="mt-4 font-serif text-[36px] font-medium leading-[1.1] tracking-tight text-navy sm:text-[44px]">
          How did today go?
        </h1>
      </header>

      <div aria-hidden className="my-8 h-px w-16 bg-slate/30" />

      <p className="font-serif text-[16px] italic text-slate">
        {targetYesterday ? "Yesterday morning" : "This morning"} you set out to:
      </p>
      <p className="mt-2 font-serif text-[22px] italic leading-relaxed text-navy">
        {intention.intention}
      </p>

      <p className="mt-8 font-serif text-[16px] italic leading-relaxed text-slate">
        Did you create it? How did it land?
      </p>

      <ReflectionForm />
    </main>
  );
}
