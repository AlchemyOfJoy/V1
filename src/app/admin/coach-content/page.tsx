import type { Metadata } from "next";
import Link from "next/link";
import {
  CONTENT_KINDS,
  approxTokens,
  buildContentBlock,
  listContent,
  type ContentKind,
} from "@/lib/coach/content";
import { btnPrimary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Content Studio · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<ContentKind, string> = Object.fromEntries(
  CONTENT_KINDS.map((k) => [k.id, k.label]),
) as Record<ContentKind, string>;

export default async function ContentStudioPage() {
  const [items, assembledBlock] = await Promise.all([
    listContent({ includeInactive: true }),
    buildContentBlock(),
  ]);

  const totalChars = items
    .filter((i) => i.is_active)
    .reduce((sum, i) => sum + i.body.length, 0);
  const blockTokens = approxTokens(assembledBlock);
  const byKind = new Map<ContentKind, typeof items>();
  for (const i of items) {
    const arr = byKind.get(i.kind) ?? [];
    arr.push(i);
    byKind.set(i.kind, arr);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
            Content Studio
          </p>
          <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy">
            Feed the <em className="text-cyan-deep">Companion</em>
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-[15px] font-light leading-relaxed text-navy/65">
            Everything you add here gets injected into the Companion&apos;s
            cached system prompt so it can think, talk, and respond like
            you. Voice samples teach it your cadence. Q&amp;A pairs teach
            it how you actually answer. Chapters teach it what you believe.
          </p>
        </div>
        <Link href="/admin/coach-content/new" className={btnPrimary}>
          + Add content
        </Link>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-navy/10 bg-mist/60 p-4">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
            Active pieces
          </p>
          <p className="mt-1 font-serif text-[28px] font-medium text-navy">
            {items.filter((i) => i.is_active).length}
          </p>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-mist/60 p-4">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/55">
            Total body
          </p>
          <p className="mt-1 font-serif text-[28px] font-medium text-navy">
            {(totalChars / 1000).toFixed(1)}K
            <span className="ml-1 font-sans text-[13px] font-normal text-navy/55">
              chars
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-deep/30 bg-white p-4">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
            Assembled block
          </p>
          <p className="mt-1 font-serif text-[28px] font-medium text-navy">
            ~{(blockTokens / 1000).toFixed(1)}K
            <span className="ml-1 font-sans text-[13px] font-normal text-navy/55">
              tokens
            </span>
          </p>
          <p className="mt-1 font-sans text-[11px] text-navy/50">
            Cached. First request after edit ≈ $
            {((blockTokens / 1_000_000) * 5 * 1.25).toFixed(3)}; subsequent
            ≈ ${((blockTokens / 1_000_000) * 5 * 0.1).toFixed(4)}.
          </p>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="mt-10 rounded-3xl border border-dashed border-navy/15 bg-white p-12 text-center">
          <p
            aria-hidden
            className="mx-auto text-[40px] leading-none text-gold"
          >
            ✦
          </p>
          <h2 className="mt-3 font-serif text-[22px] font-medium text-navy">
            Empty library
          </h2>
          <p className="mx-auto mt-2 max-w-md font-sans text-[14px] font-light text-navy/65">
            Start with 5–10 voice samples. The Companion will start
            sounding like you immediately. Then layer in Q&amp;A pairs,
            then chapters and transcripts.
          </p>
          <div className="mt-6">
            <Link href="/admin/coach-content/new" className={btnPrimary}>
              Add your first piece
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-10 space-y-8">
          {CONTENT_KINDS.map((k) => {
            const list = byKind.get(k.id);
            if (!list || list.length === 0) return null;
            return (
              <section key={k.id}>
                <h2 className="font-serif text-[22px] font-medium tracking-tight text-navy">
                  {k.label}
                  <span className="ml-2 font-sans text-[13px] font-light text-navy/45">
                    {list.length}
                  </span>
                </h2>
                <ul className="mt-3 space-y-2">
                  {list.map((item) => (
                    <li
                      key={item.id}
                      className="group flex items-start gap-4 rounded-2xl border border-navy/10 bg-white p-4 transition hover:border-cyan-deep/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-3">
                          <Link
                            href={`/admin/coach-content/${item.id}`}
                            className="font-serif text-[17px] font-medium text-navy transition hover:text-cyan-deep"
                          >
                            {item.title}
                          </Link>
                          {!item.is_active && (
                            <span className="rounded-full bg-mist px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/55">
                              Inactive
                            </span>
                          )}
                          {item.source && (
                            <span className="font-sans text-[12px] italic text-navy/50">
                              {item.source}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 font-sans text-[13px] font-light leading-relaxed text-navy/65">
                          {item.body.slice(0, 200)}
                          {item.body.length > 200 ? "…" : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 font-sans text-[11px] text-navy/45">
                          <span>{item.body.length.toLocaleString()} chars</span>
                          <span>·</span>
                          <span>~{approxTokens(item.body).toLocaleString()} tokens</span>
                          {item.tags.length > 0 && (
                            <>
                              <span>·</span>
                              <span>{item.tags.join(", ")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <section className="mt-12 rounded-2xl border border-navy/10 bg-mist/30 p-5">
        <details>
          <summary className="cursor-pointer font-sans text-[13px] font-semibold text-cyan-deep">
            Preview the assembled prompt block (what the Companion sees)
          </summary>
          <pre className="mt-3 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl bg-white p-4 font-mono text-[12px] leading-relaxed text-navy/80">
            {assembledBlock}
          </pre>
        </details>
      </section>

      {KIND_LABEL.voice && null}
    </main>
  );
}
