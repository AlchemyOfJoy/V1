import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SectionShell from "@/components/journey/SectionShell";
import CoachCard from "@/components/app/CoachCard";
import { JOURNEY } from "@/lib/itt";

export const metadata: Metadata = { robots: { index: false } };

interface Subsection {
  coach: string;
  outline: { heading: string; body: string }[];
  /** Optional related tool slugs the user might use here. */
  toolLinks?: { label: string; href: string }[];
  bookRef?: string;
}

const PAGES: Record<string, Subsection> = {
  "habit-renaissance": {
    coach:
      "Mornings set the day. Evenings set the next morning. Build the two bookends, and the middle takes care of itself.",
    outline: [
      {
        heading: "Morning Orbit",
        body: "A 30–90 minute morning routine that includes: a glass of water, daylight on the eyes within 10 minutes of waking, the SubScript read, one act of movement, and a single intention captured. Done in this order, it puts your nervous system in ventral-vagal before the day even starts.",
      },
      {
        heading: "Evening Wind-Down",
        body: "A 30–60 minute pre-sleep ritual: screens off two hours before bed if you can, lights dimmed, the evening SubScript read, the day's ITT loop closed, a Joy Pulse logged. Sleep is the consolidation layer for everything you did today.",
      },
      {
        heading: "How to install it",
        body: "Pick one bookend at a time. Run it for seven days. When it feels automatic, add the other. Don't try to install both in week one — that's how routines collapse.",
      },
    ],
    toolLinks: [
      {
        label: "Morning Orbit (Tool Kit)",
        href: "/toolkit?focus=morning-orbit",
      },
      {
        label: "Evening Wind-Down (Tool Kit)",
        href: "/toolkit?focus=evening-wind-down",
      },
      {
        label: "Joyful Habit Framework — D.A.D.",
        href: "/toolkit?focus=joyful-habit-dad",
      },
    ],
    bookRef: "Ch. 16b + workbook Module 4",
  },
  "sleep-foundation": {
    coach:
      "Joy without sleep is a leaky bucket. Everything else compounds slower until this is solid.",
    outline: [
      {
        heading: "The 14-tool checklist",
        body: "Brent's full sleep foundation — temperature (65–68°F), darkness (full blackout), screens off, no caffeine after noon, no alcohol within three hours of bed, magnesium, mouth-tape if appropriate, daylight in the morning, exercise but not within 3 hours of sleep, consistent timing, the wind-down ritual, no work in the bedroom, the bedroom only for two things, and a clear morning anchor.",
      },
      {
        heading: "Pick three to start",
        body: "Don't try to install all fourteen tonight. Pick the three that would move the needle most for you. Run them for two weeks. Then add three more.",
      },
    ],
    bookRef: "Ch. 18",
  },
  "dopamine-detox": {
    coach:
      "Cheap dopamine isn't the problem — it's the thief. Detox isn't punishment. It's reclaiming your reward system so real things feel real again.",
    outline: [
      {
        heading: "What gets detoxed",
        body: "Social media scrolling. News doomscroll. Short-form video. Alcohol. Sugar. Porn. Anything that hits the reward circuit fast and leaves you flatter than you started.",
      },
      {
        heading: "30 days or 90 days",
        body: "Start with 30 if it's your first time. 90 if you've done a 30 already. The first week is the hardest by miles. Day 8 onward, the world starts looking different.",
      },
      {
        heading: "What replaces it",
        body: "Long walks. Books. Hard physical training. Real conversations. Cold water. The List of Joy. Your nervous system is going to feel bored at first. Boredom is the doorway out.",
      },
    ],
    bookRef: "Ch. 17 + Tool Kit",
  },
  "zero-gravity": {
    coach:
      "If you're doing tasks beneath your hourly value, you're stealing time from the work only you can do. The audit is unromantic. The freedom on the other side is enormous.",
    outline: [
      {
        heading: "Calculate your hourly rate",
        body: "Annual income ÷ working hours = your hourly. Be honest. (If you don't have income yet, use the rate you intend to be at within a year.)",
      },
      {
        heading: "Make the delegation list",
        body: "Every recurring task you do that you could pay someone less than your hourly to do — write it down. Lawn. Laundry. Inbox. Errands. Bookkeeping. Cleaning. The list is longer than you think.",
      },
      {
        heading: "Delegate one per week",
        body: "Don't do it all at once. One task per week, off your plate, for the rest of your life. Inside a year, you'll have your time back.",
      },
    ],
    bookRef: "Ch. 37",
  },
  "expectations-standards": {
    coach:
      "Expectations are hopes you're holding for other people. Standards are the boundaries you set for yourself. The first will make you suffer. The second will set you free.",
    outline: [
      {
        heading: "Side-by-side conversion",
        body: "Make two columns. Left: an expectation you're carrying ('my partner should know what I need without me having to ask'). Right: the standard for you ('I will say what I need clearly, every time, even when it's uncomfortable'). Convert one expectation per day for a week.",
      },
    ],
    bookRef: "Ch. 39",
  },
  jomo: {
    coach:
      "FOMO is reactive. JOMO is decided. The Joy Of Missing Out is what happens when you've defined your YES so clearly that every NO feels like a YES to the life you're actually building.",
    outline: [
      {
        heading: "Build the weekly NO list",
        body: "Each Sunday, write the things you're saying NO to this week — invitations, requests, optional meetings, the algorithm. Pair each NO with the YES it protects. 'NO to the work happy hour Friday' becomes 'YES to dinner at home with the kids.'",
      },
    ],
    bookRef: "Ch. 41",
  },
  "joyful-conflict": {
    coach:
      "Most conflicts go sideways because we walked in dysregulated. The Joyful Conflict Prep is a five-minute reset before the hard conversation that changes how the conversation lands.",
    outline: [
      {
        heading: "Before you open your mouth",
        body: "Five minutes alone. Reset Breath × 3. Name what you actually want from this conversation — not what you want them to do, but what you want to feel afterward. Decide what you will NOT do (raise voice, leave the room, weaponize the past). Walk in.",
      },
    ],
    bookRef: "Ch. 24",
  },
};

const pillar = JOURNEY.find((p) => p.slug === "take-bold-action")!;

export default async function TbaSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = pillar.sections.find((s) => s.slug === slug);
  const data = PAGES[slug];
  if (!section || !data) notFound();

  return (
    <SectionShell
      pillarLabel="Take Bold Action"
      pillarHref="/journey/take-bold-action"
      title={section.title}
      italicWord={section.italicWord}
      oneLiner={section.oneLiner}
      estimatedMin={section.estimatedMin}
    >
      <CoachCard mode="steady" body={data.coach} />

      <section className="mt-8 space-y-6">
        {data.outline.map((o) => (
          <div key={o.heading}>
            <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
              {o.heading}
            </h2>
            <p className="mt-2 font-sans text-[15px] font-light leading-[1.85] text-navy/75">
              {o.body}
            </p>
          </div>
        ))}
      </section>

      {data.toolLinks && (
        <section className="mt-8 rounded-3xl border border-cyan-deep/25 bg-mist/40 p-5">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep">
            Use these tools in the moment
          </p>
          <ul className="mt-3 space-y-2">
            {data.toolLinks.map((t) => (
              <li key={t.label}>
                <Link
                  href={t.href}
                  className="font-sans text-[14px] font-medium text-cyan-deep hover:underline"
                >
                  → {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.bookRef && (
        <p className="mt-8 font-sans text-[12px] italic text-navy/45">
          Source: {data.bookRef} · [Brent: replace this scaffolding with
          verbatim passages via the Content Studio when ready.]
        </p>
      )}
    </SectionShell>
  );
}
