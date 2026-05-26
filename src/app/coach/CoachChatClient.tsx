"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  text: string;
}

/**
 * Minimal BrentBot chat surface (Synthesis Spec §4).
 *
 * Plain editorial layout: header eyebrow, threaded messages, single
 * input at the bottom. Streams responses via fetch + ReadableStream
 * from /api/coach. Per directive §4.5, the bot replies in Brent's
 * voice and falls back to crisis routing when needed (the server-side
 * system prompt handles that).
 */
export default function CoachChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send() {
    const message = text.trim();
    if (!message || busy) return;
    setText("");
    setBusy(true);
    setError(null);
    setMessages((m) => [...m, { role: "user", text: message }]);
    setMessages((m) => [...m, { role: "assistant", text: "" }]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't reach the coach.");
        setMessages((m) => m.slice(0, -1));
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let pinnedConv = false;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // The API emits `__conv__<id>\n` as the first chunk so the
        // client can pin to a new conversation on first turn.
        if (!pinnedConv && buffer.startsWith("__conv__")) {
          const newline = buffer.indexOf("\n");
          if (newline > 0) {
            const id = buffer.slice("__conv__".length, newline);
            if (id && id !== "null") setConversationId(id);
            buffer = buffer.slice(newline + 1);
            pinnedConv = true;
          }
        }
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", text: buffer };
          return copy;
        });
      }
    } catch (err) {
      setError((err as Error).message);
      setMessages((m) => m.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col px-6 pb-8 pt-10 sm:pt-14">
      <Link
        href="/home"
        className="font-sans text-[12px] text-slate hover:text-cyan"
      >
        ← Home
      </Link>

      <header className="mt-8 flex items-baseline gap-3 border-b border-slate/15 pb-6">
        <span aria-hidden className="text-[20px] text-gold">
          ✦
        </span>
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-navy">
          BrentBot
        </p>
        <span className="font-sans text-[11px] text-slate">
          Trained on Brent&apos;s work
        </span>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto py-6"
      >
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="font-serif text-[20px] italic leading-relaxed text-navy">
              Hey. I&apos;m here. What&apos;s going on?
            </p>
            <p className="font-sans text-[13px] font-light leading-relaxed text-slate">
              Stuck on an exercise? Hard moment? Question about the
              methodology? Just say it.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <article
            key={i}
            className={
              m.role === "assistant"
                ? "border-l-2 border-cyan/60 pl-4"
                : "rounded-2xl bg-mist px-4 py-3"
            }
          >
            {m.role === "assistant" ? (
              <p className="font-serif text-[17px] italic leading-relaxed text-navy">
                {m.text || "…"}
              </p>
            ) : (
              <p className="font-serif text-[17px] leading-relaxed text-navy">
                {m.text}
              </p>
            )}
          </article>
        ))}
        {error && (
          <p className="font-sans text-[13px] text-red-700">{error}</p>
        )}
      </div>

      <div className="border-t border-slate/15 pt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder="Say it plainly…"
          className="w-full resize-none border-0 bg-transparent py-2 font-serif text-[17px] leading-relaxed text-navy outline-none placeholder:text-slate/45 focus:ring-0"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="font-sans text-[11px] text-slate/55">
            ⌘ + Enter to send
          </p>
          <button
            type="button"
            onClick={send}
            disabled={busy || !text.trim()}
            className="inline-flex items-center justify-center rounded-full bg-cyan px-6 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-navy disabled:opacity-50"
          >
            {busy ? "…" : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
}
