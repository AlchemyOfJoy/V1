import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  findBoldActionTool,
  journalIdForTool,
  type BoldActionTool,
} from "@/lib/bold-action";
import { listJournalEntries } from "@/lib/journal";
import ToolShell from "@/components/curriculum/bold-action/ToolShell";
import JoySparkTool from "@/components/curriculum/bold-action/JoySparkTool";
import SixtySecondResetTool from "@/components/curriculum/bold-action/SixtySecondResetTool";
import HourlyAuditTool from "@/components/curriculum/bold-action/HourlyAuditTool";
import {
  BoldAskTool,
  EnergyInventoryTool,
  EveningCheckInTool,
  GratitudeThreeTool,
  IdentityDeclarationTool,
  ReframeNowTool,
  TinyBraveActTool,
} from "@/components/curriculum/bold-action/TextTools";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = findBoldActionTool(slug);
  return {
    title: tool ? tool.title : "Bold Action",
    robots: { index: false },
  };
}

function Intro({ tool }: { tool: BoldActionTool }) {
  switch (tool.kind) {
    case "breath":
      return (
        <p>
          Use this any time you feel your shoulders rise toward your ears. It
          takes ninety seconds. It works because your body and your story
          share a nervous system.
        </p>
      );
    case "timer":
      return (
        <p>
          Box breathing — inhale, hold, exhale, hold — for sixty seconds.
          The most well-studied state-shift tool in the world, and the
          cheapest one to use.
        </p>
      );
    case "calculator":
      return (
        <p>
          Most weeks slip past us without honest math. This tool gives you
          the math. Don&apos;t aim for perfection — aim for awareness.
        </p>
      );
    case "gratitude":
      return (
        <p>
          The brain&apos;s gratitude muscle gets stronger with specificity.
          Three precise things beats thirty vague ones every time.
        </p>
      );
    case "reframe":
      return (
        <p>
          On-the-spot rewrite of whatever story you&apos;re telling yourself
          right now. Lighter version of the Core Narrative practice — use it
          in the wild.
        </p>
      );
    case "ask":
      return (
        <p>
          You already know the ask. We&apos;re just going to give you a
          place to put it down and a chance to commit to sending it.
        </p>
      );
    case "identity":
      return (
        <p>
          You&apos;re always rehearsing some identity. This rehearses the
          one you&apos;re choosing.
        </p>
      );
    case "energy":
      return (
        <p>
          Two columns. Honest answers. After a week of these, the pattern
          tells you what to keep and what to quietly let go.
        </p>
      );
    case "tiny_brave":
      return (
        <p>
          Bravery is not built in big leaps. It&apos;s built in small ones
          you actually take. Name one. Take it.
        </p>
      );
    case "evening":
      return (
        <p>
          A 60-second close to the day. Three questions. Grace on the way
          to sleep.
        </p>
      );
  }
}

function Tool({
  tool,
  initialEntries,
}: {
  tool: BoldActionTool;
  initialEntries: {
    id: string;
    body: string;
    title: string | null;
    created_at: string;
  }[];
}) {
  switch (tool.kind) {
    case "breath":
      return <JoySparkTool initialEntries={initialEntries} />;
    case "timer":
      return <SixtySecondResetTool initialEntries={initialEntries} />;
    case "calculator":
      return <HourlyAuditTool initialEntries={initialEntries} />;
    case "gratitude":
      return <GratitudeThreeTool initialEntries={initialEntries} />;
    case "reframe":
      return <ReframeNowTool initialEntries={initialEntries} />;
    case "ask":
      return <BoldAskTool initialEntries={initialEntries} />;
    case "identity":
      return <IdentityDeclarationTool initialEntries={initialEntries} />;
    case "energy":
      return <EnergyInventoryTool initialEntries={initialEntries} />;
    case "tiny_brave":
      return <TinyBraveActTool initialEntries={initialEntries} />;
    case "evening":
      return <EveningCheckInTool initialEntries={initialEntries} />;
  }
}

export default async function BoldActionToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { slug } = await params;
  const tool = findBoldActionTool(slug);
  if (!tool) notFound();

  const rows = await listJournalEntries(user.id, journalIdForTool(slug), 20);
  const initialEntries = rows.map((r) => ({
    id: String(r.id),
    body: r.body,
    title: r.title,
    created_at:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : r.created_at,
  }));

  return (
    <main className="px-6 py-12 sm:py-16">
      <ToolShell tool={tool} intro={<Intro tool={tool} />}>
        <Tool tool={tool} initialEntries={initialEntries} />
      </ToolShell>
    </main>
  );
}
