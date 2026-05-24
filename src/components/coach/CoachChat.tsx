"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { btnPrimary } from "@/lib/ui";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface ConversationSummary {
  id: string;
  title: string | null;
  last_message_at: string | Date;
}

const SUGGESTIONS = [
  "I'm spiraling — can you walk me through a Joy Spark?",
  "An old story is loud today. Help me catch it.",
  "I'm avoiding a hard conversation. Help me write the ask.",
  "I want to feel like myself again. Where do I start?",
];

function renderMarkdown(text: string): React.ReactNode {
  // Lightweight markdown — links + bold + italics + line breaks. No
  // raw HTML, all output is escaped via React text nodes.
  const blocks: React.ReactNode[] = [];
  const lines = text.split("\n");
  let key = 0;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (line === "") {
      blocks.push(<br key={key++} />);
      continue;
    }
    const parts: React.ReactNode[] = [];
    const rest = line;
    // Inline patterns: [label](url) | **bold** | *italic* | _italic_
    const re =
      /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    while ((match = re.exec(rest)) !== null) {
      if (match.index > lastIndex) {
        parts.push(rest.slice(lastIndex, match.index));
      }
      if (match[1] && match[2]) {
        const href = match[2];
        // Only allow same-origin relative paths or https.
        const safe =
          href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://");
        parts.push(
          safe ? (
            <Link
              key={key++}
              href={href}
              className="font-semibold text-cyan-deep underline decoration-cyan-deep/40 underline-offset-2 hover:decoration-cyan-deep"
            >
              {match[1]}
            </Link>
          ) : (
            <span key={key++}>{match[1]}</span>
          ),
        );
      } else if (match[3]) {
        parts.push(
          <strong key={key++} className="font-semibold text-navy">
            {match[3]}
          </strong>,
        );
      } else if (match[4] || match[5]) {
        parts.push(
          <em key={key++} className="italic">
            {match[4] || match[5]}
          </em>,
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < rest.length) {
      parts.push(rest.slice(lastIndex));
    }
    blocks.push(
      <span key={key++}>
        {parts}
        {li < lines.length - 1 && <br />}
      </span>,
    );
  }
  return blocks;
}

export default function CoachChat({
  initialConversationId,
  initialMessages,
  initialConversations,
}: {
  initialConversationId: string | null;
  initialMessages: Message[];
  initialConversations: ConversationSummary[];
}) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [conversations, setConversations] =
    useState<ConversationSummary[]>(initialConversations);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingText]);

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 280) + "px";
  }

  async function send(text?: string) {
    const content = (text ?? draft).trim();
    if (!content || streaming) return;
    setError(null);
    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const optimisticUser: Message = {
      id: `local-${Date.now()}`,
      role: "user",
      content,
    };
    setMessages((cur) => [...cur, optimisticUser]);
    setStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: content,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream unavailable.");

      const decoder = new TextDecoder();
      let buffer = "";
      let firstChunk = true;
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer = decoder.decode(value, { stream: true });

        if (firstChunk && buffer.startsWith("__conv__")) {
          const newlineIdx = buffer.indexOf("\n");
          if (newlineIdx > -1) {
            const newId = buffer.slice("__conv__".length, newlineIdx);
            if (newId && newId !== conversationId) {
              setConversationId(newId);
              router.replace(`/coach?c=${newId}`, { scroll: false });
            }
            buffer = buffer.slice(newlineIdx + 1);
            firstChunk = false;
          }
        }

        assistantText += buffer;
        setStreamingText(assistantText);
      }

      const finalAssistant: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantText,
      };
      setMessages((cur) => [...cur, finalAssistant]);
      setStreamingText("");

      // Refresh sidebar so the new (or updated) conversation surfaces.
      fetch("/api/coach/conversations")
        .then((r) => r.json())
        .then((d) => setConversations(d.conversations ?? []))
        .catch(() => {});
    } catch (e) {
      setError((e as Error).message);
      // Drop the optimistic user message so they can retry.
      setMessages((cur) => cur.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setStreaming(false);
    }
  }

  function newConversation() {
    setConversationId(null);
    setMessages([]);
    setStreamingText("");
    setError(null);
    router.replace("/coach", { scroll: false });
  }

  async function switchConversation(id: string) {
    if (id === conversationId) return;
    setError(null);
    try {
      const res = await fetch(`/api/coach/conversations/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't load.");
      setConversationId(id);
      setMessages(
        (data.messages ?? []).map(
          (m: { id: string; role: "user" | "assistant"; content: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          }),
        ),
      );
      setStreamingText("");
      router.replace(`/coach?c=${id}`, { scroll: false });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function removeConversation(id: string) {
    if (!confirm("Delete this conversation? Your messages will be removed.")) return;
    const prev = conversations;
    setConversations((cur) => cur.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/coach/conversations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      if (id === conversationId) newConversation();
    } catch {
      setConversations(prev);
      setError("Couldn't delete — try again?");
    }
  }

  const isEmpty = messages.length === 0 && !streamingText;

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r border-navy/10 bg-mist/40 lg:flex lg:flex-col">
        <div className="border-b border-navy/10 p-4">
          <button
            type="button"
            onClick={newConversation}
            className={`${btnPrimary} w-full`}
          >
            + New conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <p className="px-2 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/55">
            Recent
          </p>
          {conversations.length === 0 ? (
            <p className="px-2 font-sans text-[12px] font-light text-navy/50">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => switchConversation(c.id)}
                    className={`block w-full truncate rounded-lg px-3 py-2 text-left font-sans text-[13px] transition ${
                      c.id === conversationId
                        ? "bg-white text-cyan-deep shadow-sm"
                        : "text-navy/75 hover:bg-white hover:text-cyan-deep"
                    }`}
                  >
                    {c.title || "Untitled conversation"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeConversation(c.id)}
                    aria-label="Delete conversation"
                    className="absolute right-1.5 top-1.5 rounded px-1 font-sans text-[11px] text-navy/35 opacity-0 transition group-hover:opacity-100 hover:text-[#8a6d00]"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-navy/10 p-4">
          <p className="font-sans text-[11px] font-light leading-relaxed text-navy/55">
            The Companion is not a therapist or crisis line. If you&apos;re
            in crisis, call <strong className="text-navy">988</strong> in
            the US or <strong className="text-navy">findahelpline.com</strong>{" "}
            elsewhere.
          </p>
        </div>
      </aside>

      {/* Main */}
      <section className="flex h-full flex-col">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-8 sm:px-8"
        >
          <div className="mx-auto max-w-3xl">
            {isEmpty ? (
              <div className="space-y-8 pt-8 text-center">
                <div>
                  <p
                    aria-hidden
                    className="text-[40px] leading-none text-gold"
                  >
                    ✦
                  </p>
                  <h1 className="mt-4 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy sm:text-[44px]">
                    Your <em className="text-cyan-deep">Companion</em>
                  </h1>
                  <p className="mx-auto mt-3 max-w-xl font-sans text-[15px] font-light leading-relaxed text-navy/65">
                    Trained on Brent&apos;s book, retreats, and methodology —
                    here at three in the morning when the old story shows up
                    again. Tell me what&apos;s coming up.
                  </p>
                </div>
                <ul className="mx-auto grid max-w-xl gap-2 text-left sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => send(s)}
                        className="block h-full w-full rounded-2xl border border-navy/12 bg-white p-4 text-left font-serif text-[15px] italic leading-relaxed text-navy transition hover:border-cyan-deep/40 hover:bg-mist"
                      >
                        “{s}”
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="space-y-6">
                {messages.map((m) => (
                  <li key={m.id} className="animate-fade-in">
                    {m.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-cyan-deep px-5 py-3 font-sans text-[15px] leading-[1.7] text-white">
                          {renderMarkdown(m.content)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div
                          aria-hidden
                          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 font-serif text-[14px] text-gold"
                        >
                          ✦
                        </div>
                        <div className="font-serif text-[17px] leading-[1.85] text-navy">
                          {renderMarkdown(m.content)}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                {streaming && streamingText && (
                  <li className="animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div
                        aria-hidden
                        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 font-serif text-[14px] text-gold"
                      >
                        ✦
                      </div>
                      <div className="font-serif text-[17px] leading-[1.85] text-navy">
                        {renderMarkdown(streamingText)}
                        <span
                          aria-hidden
                          className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-cyan-deep align-middle"
                        />
                      </div>
                    </div>
                  </li>
                )}
                {streaming && !streamingText && (
                  <li className="flex items-center gap-3 font-sans text-[13px] text-navy/50">
                    <span
                      aria-hidden
                      className="h-2 w-2 animate-pulse rounded-full bg-cyan-deep"
                    />
                    Thinking…
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {error && (
          <div className="border-t border-gold/40 bg-gold/10 px-4 py-2 text-center font-sans text-[13px] text-[#8a6d00]">
            {error}
          </div>
        )}

        <div className="border-t border-navy/10 bg-white px-4 py-4 sm:px-8">
          <form
            className="mx-auto flex max-w-3xl items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                autoGrow(e.currentTarget);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              disabled={streaming}
              placeholder="Tell me what's coming up…"
              className="max-h-72 min-h-[52px] flex-1 resize-none rounded-2xl border border-navy/15 bg-white px-5 py-3.5 font-sans text-[15px] leading-relaxed text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={streaming || !draft.trim()}
              className={`${btnPrimary} h-[52px]`}
            >
              {streaming ? "…" : "Send"}
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl font-sans text-[11px] font-light text-navy/45">
            Enter to send · Shift+Enter for a new line · Not a substitute for
            therapy or crisis support
          </p>
        </div>
      </section>
    </div>
  );
}
