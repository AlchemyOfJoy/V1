import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findTool } from "@/lib/toolkit-20";
import { Tridot } from "@/components/app/Wave";

export const metadata: Metadata = { robots: { index: false } };

const REFERENCE_BODY: Record<string, React.ReactNode> = {
  "biological-prime-time": (
    <>
      <p>
        Your biological prime time is the 3-4 hour window each day when
        your focus, energy, and willpower are at their peak. Your down
        time is the opposite window.
      </p>
      <p className="mt-4">
        Track for two weeks. Notice when you focus best, when you crash,
        when you bounce back. Then — ruthlessly — protect prime time for
        the highest-leverage work. Move admin to down windows.
      </p>
    </>
  ),
  "emotional-alchemy": (
    <>
      <p>
        Four steps to transform difficult emotion into clarity instead of
        suppressing it.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-6">
        <li>Name the emotion precisely.</li>
        <li>Locate it in the body.</li>
        <li>Ask what it&apos;s trying to protect.</li>
        <li>Decide what it needs from you right now.</li>
      </ol>
    </>
  ),
  "joy-judo": (
    <>
      <p>
        Use the energy of a hard moment rather than fighting it. Anger
        has energy. Grief has energy. Anxiety has enormous energy. Joy
        Judo redirects it.
      </p>
      <p className="mt-4">
        When a hard emotion arrives, ask:{" "}
        <em>what does this want me to do?</em> Then channel the energy
        into one small action aligned with your values.
      </p>
    </>
  ),
  "joyful-habit-dad": (
    <>
      <p className="font-sans uppercase tracking-[0.2em] text-cyan-deep text-[12px] font-semibold">
        D.A.D.
      </p>
      <ol className="mt-4 list-decimal space-y-3 pl-6">
        <li>
          <strong>Decide</strong> — pick one habit, in writing, with a
          specific trigger.
        </li>
        <li>
          <strong>Anchor</strong> — attach it to something you already
          do without thinking.
        </li>
        <li>
          <strong>Delight</strong> — pair it with something joyful.
          Without delight, habits die.
        </li>
      </ol>
    </>
  ),
  "law-of-expansion": (
    <>
      <p>What you focus on, expands. That&apos;s the whole law.</p>
      <p className="mt-4">
        Your RAS confirms it. The List of Joy applies it. The SubScript
        installs it twice a day. Focus on what&apos;s right and possible;
        find more of it.
      </p>
    </>
  ),
  "spirit-walks": (
    <>
      <p>
        A 30+ minute walk without earbuds, phone, or destination. Just
        walking, eyes open, letting what&apos;s on top of your mind work
        its way through.
      </p>
      <p className="mt-4">
        The combination of bilateral motion and present-moment input —
        what your eyes actually see, what your ears actually hear — moves
        processing in a way no other tool quite matches.
      </p>
    </>
  ),
};

export default async function ToolReferencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) notFound();
  if (tool.interactive && tool.href !== `/toolkit/${slug}`) {
    redirect(tool.href);
  }

  const body = REFERENCE_BODY[slug];

  return (
    <article className="mx-auto max-w-2xl space-y-7 px-5 pb-12 pt-6 sm:pt-10">
      <Link
        href="/toolkit"
        className="inline-block font-sans text-[12px] text-navy/55 hover:text-cyan-deep"
      >
        ← Tool Kit
      </Link>
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Tool {String(tool.id).padStart(2, "0")} · {tool.time}
        </p>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          {tool.name}
        </h1>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-navy/65">
          {tool.when}
        </p>
      </header>

      <Tridot />

      <section className="font-serif text-[17px] leading-[1.85] text-navy/85">
        {body ?? (
          <p className="italic text-navy/55">
            Reference card — to be filled in via the Content Studio.
          </p>
        )}
      </section>
    </article>
  );
}
