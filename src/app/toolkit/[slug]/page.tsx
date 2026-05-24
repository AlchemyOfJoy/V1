import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findTool } from "@/lib/toolkit-20";

export const metadata: Metadata = { robots: { index: false } };

const REFERENCE_BODY: Record<string, React.ReactNode> = {
  "biological-prime-time": (
    <>
      <p>
        Your biological prime time is the 3-4 hour window each day when your
        focus, energy, and willpower are at their peak. Same goes for your
        biological down time — when you&apos;re flatter and shouldn&apos;t
        try to do heavy creative work.
      </p>
      <p>
        Track for two weeks. Note when you naturally focus best, when you
        crash, when you bounce back. The pattern emerges quickly. Then —
        ruthlessly — protect prime time for the highest-leverage work. Move
        admin, meetings, and email to your down windows.
      </p>
    </>
  ),
  "emotional-alchemy": (
    <>
      <p>
        The Emotional Alchemy Formula is a four-step practice for
        transforming difficult emotion into clarity, instead of suppressing
        or acting on it.
      </p>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Name the emotion as precisely as you can.</li>
        <li>Locate it in the body. Where is it sitting? Tightness, heat?</li>
        <li>Ask: what is this emotion trying to protect or tell me?</li>
        <li>Decide: what does this emotion need from me right now?</li>
      </ol>
    </>
  ),
  "joy-judo": (
    <>
      <p>
        Joy Judo is the practice of using the energy of a hard moment
        rather than fighting it. Anger has energy. Grief has energy.
        Anxiety has enormous energy. Joy Judo redirects it.
      </p>
      <p>
        Practice: when a hard emotion arrives, ask &mdash;{" "}
        <em>what does this emotion want me to do?</em> Then channel the
        energy into a single small action aligned with your values.
      </p>
    </>
  ),
  "joyful-habit-dad": (
    <>
      <p>
        The D.A.D. Joyful Habit Framework — <strong>D</strong>ecide,{" "}
        <strong>A</strong>nchor, <strong>D</strong>elight.
      </p>
      <ol className="list-decimal pl-6 space-y-2">
        <li>
          <strong>Decide</strong> — pick one new habit, in writing, with a
          specific trigger.
        </li>
        <li>
          <strong>Anchor</strong> — attach the habit to something you
          already do without thinking (after morning coffee, before
          brushing teeth).
        </li>
        <li>
          <strong>Delight</strong> — pair it with something joyful (the
          song, the view, the gratitude). Without delight, habits die.
        </li>
      </ol>
    </>
  ),
  "law-of-expansion": (
    <>
      <p>
        What you focus on, expands. That&apos;s the whole law. Your RAS
        confirms it. The List of Joy applies it. The SubScript installs it
        twice a day.
      </p>
      <p>
        Focus on what&apos;s wrong, and you&apos;ll find more of it. Focus
        on what&apos;s right and possible, and you&apos;ll find more of
        that. It&apos;s not magic — it&apos;s neurology.
      </p>
    </>
  ),
  "spirit-walks": (
    <>
      <p>
        A Spirit Walk is a 30+ minute walk taken without earbuds, without
        phone, without a destination. Just walking, eyes open, letting
        what&apos;s on top of your mind work its way through.
      </p>
      <p>
        The combination of bilateral motion and present-moment input — what
        your eyes see, what your ears actually hear — moves processing in a
        way no other tool quite matches. Try one this week.
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
  // If the tool is interactive and lives elsewhere, redirect there.
  if (tool.interactive && tool.href !== `/toolkit/${slug}`) {
    redirect(tool.href);
  }

  const body = REFERENCE_BODY[slug];

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-5 py-10">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Tool {String(tool.id).padStart(2, "0")} · {tool.type} · {tool.time}
        </p>
        <h1 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
          {tool.name}
        </h1>
        <p className="mt-3 font-sans text-[16px] font-light leading-relaxed text-navy/65">
          {tool.when}
        </p>
      </header>

      <section className="space-y-4 font-serif text-[17px] leading-[1.85] text-navy/85">
        {body ?? (
          <p className="italic text-navy/55">
            Reference card to be filled in via the Content Studio.
          </p>
        )}
      </section>

      <p className="font-sans text-[12px] italic text-navy/45">
        [Brent: replace this card with verbatim workbook text via the
        Content Studio when ready.]
      </p>

      <Link
        href="/toolkit"
        className="font-sans text-[13px] text-navy/55 hover:text-cyan-deep"
      >
        ← Back to Tool Kit
      </Link>
    </article>
  );
}
