"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { btnPrimary } from "@/lib/ui";
import { CONTENT_KINDS, type ContentItem } from "@/lib/coach/content-types";

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55";
const textareaClass =
  "w-full resize-y rounded-2xl border border-navy/15 bg-white px-5 py-4 font-serif text-[15px] leading-[1.85] text-navy outline-none transition placeholder:font-sans placeholder:text-[14px] placeholder:font-light placeholder:text-navy/40 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";

interface Props {
  existing?: ContentItem;
}

export default function ContentForm({ existing }: Props) {
  const router = useRouter();
  const [kind, setKind] = useState(existing?.kind ?? "voice");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [source, setSource] = useState(existing?.source ?? "");
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [sortOrder, setSortOrder] = useState(existing?.sort_order ?? 100);
  const [isActive, setIsActive] = useState(existing?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const helper = useMemo(
    () => CONTENT_KINDS.find((k) => k.id === kind)?.helper ?? "",
    [kind],
  );
  const approxTokens = Math.ceil(body.length / 4);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      kind,
      title: title.trim(),
      body: body.trim(),
      source: source.trim() || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      sort_order: Number(sortOrder) || 100,
      is_active: isActive,
    };
    try {
      const res = existing
        ? await fetch(`/api/admin/coach-content/${existing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/coach-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save.");
      router.push("/admin/coach-content");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!existing) return;
    if (!confirm("Delete this piece? It will be removed from the Companion."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/coach-content/${existing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push("/admin/coach-content");
      router.refresh();
    } catch {
      setError("Couldn't delete — try again?");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <div>
          <label className={labelClass} htmlFor="kind">
            Kind
          </label>
          <select
            id="kind"
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as ContentItem["kind"])
            }
            className={`${inputClass} mt-2`}
            disabled={!!existing}
          >
            {CONTENT_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
          {!!existing && (
            <p className="mt-1 font-sans text-[11px] text-navy/45">
              Kind can&apos;t change after creation.
            </p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="e.g. Opening of chapter 3 / Q&A on perfectionism / Voice sample — joy is a skill"
            className={`${inputClass} mt-2`}
          />
        </div>
      </div>

      {helper && (
        <p className="rounded-2xl border border-cyan-deep/20 bg-mist/60 px-4 py-3 font-sans text-[13px] font-light leading-relaxed text-navy/70">
          {helper}
        </p>
      )}

      <div>
        <div className="flex items-baseline justify-between">
          <label className={labelClass} htmlFor="body">
            Body
          </label>
          <span className="font-sans text-[11px] text-navy/45">
            {body.length.toLocaleString()} chars · ~
            {approxTokens.toLocaleString()} tokens
          </span>
        </div>
        <textarea
          id="body"
          rows={24}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          placeholder={
            kind === "qa"
              ? "Q: …\nA: …"
              : kind === "voice"
                ? "Paste a passage that exemplifies how you write — the cadence, the choices, the moments of silence between sentences."
                : "Paste the full content. Caching makes long pieces cheap."
          }
          className={`${textareaClass} mt-2`}
        />
        <p className="mt-1 font-sans text-[11px] text-navy/45">
          Markdown headings, bold, and italics render. Don&apos;t paste
          raw HTML.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="source">
            Source (optional)
          </label>
          <input
            id="source"
            type="text"
            value={source ?? ""}
            onChange={(e) => setSource(e.target.value)}
            maxLength={200}
            placeholder="e.g. Book ch. 3 / Sedona retreat Mar 2025 / Newsletter #42"
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. forgiveness, parts, somatic"
            className={`${inputClass} mt-2`}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="sort_order">
            Sort order (lower = earlier in the prompt)
          </label>
          <input
            id="sort_order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className={`${inputClass} mt-2`}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 font-sans text-[14px] text-navy">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-cyan-deep"
            />
            Active (include in the Companion&apos;s prompt)
          </label>
        </div>
      </div>

      {error && (
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-6">
        <Link
          href="/admin/coach-content"
          className="font-sans text-[13px] text-navy/55 hover:text-cyan-deep"
        >
          ← Back to library
        </Link>
        <div className="flex gap-3">
          {existing && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-full border border-[#8a6d00]/30 px-5 py-2.5 font-sans text-[13px] font-medium text-[#8a6d00] transition hover:bg-[#fdf6e0]"
            >
              Delete
            </button>
          )}
          <button type="submit" className={btnPrimary} disabled={busy}>
            {busy ? "…" : existing ? "Save changes" : "Add to library"}
          </button>
        </div>
      </div>
    </form>
  );
}
