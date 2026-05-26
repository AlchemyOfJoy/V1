"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Status = "ask" | "better" | "same" | "worse";

export default function CheckInClient() {
  const [status, setStatus] = useState<Status>("ask");
  const router = useRouter();

  // Auto-route home after the "better" close moment
  useEffect(() => {
    if (status === "better") {
      const t = setTimeout(() => router.push("/home"), 3500);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  if (status === "better") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center animate-fade-in">
        <p
          aria-hidden
          className="text-[44px] leading-none text-gold"
        >
          ✦
        </p>
        <h1 className="mt-8 font-serif text-[32px] font-medium leading-tight text-navy">
          That&apos;s the <em className="text-cyan">work</em>.
        </h1>
        <p className="mt-4 font-serif text-[18px] italic leading-relaxed text-slate">
          You alchemized it.
        </p>
        <p className="mt-12 font-sans text-[11px] uppercase tracking-[0.26em] text-slate/55">
          Back to Today in a moment…
        </p>
      </main>
    );
  }

  if (status === "same") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center animate-fade-in">
        <h1 className="font-serif text-[32px] font-medium leading-tight text-navy">
          Stay with it.
        </h1>
        <p className="mt-4 font-serif text-[18px] italic leading-relaxed text-slate">
          Sometimes one tool isn&apos;t enough.
        </p>
        <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setStatus("ask")}
            className="inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
          >
            Try another tool
          </button>
          <Link
            href="/home"
            className="inline-flex items-center justify-center rounded-full border border-slate/30 px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-navy hover:border-cyan hover:text-cyan"
          >
            Take a break
          </Link>
        </div>
      </main>
    );
  }

  if (status === "worse") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center animate-fade-in">
        <h1 className="font-serif text-[32px] font-medium leading-tight text-navy">
          I&apos;m sorry.
        </h1>
        <p className="mt-4 font-serif text-[18px] italic leading-relaxed text-navy">
          This is bigger than I can hold.
        </p>
        <p className="mt-4 font-sans text-[15px] font-light leading-relaxed text-slate">
          Real humans are available 24/7.
        </p>
        <ul className="mt-8 w-full max-w-sm divide-y divide-slate/15">
          <li>
            <a
              href="tel:988"
              className="flex items-center justify-between py-4 text-left transition hover:text-cyan"
            >
              <span className="font-sans text-[15px] font-semibold text-navy">
                Call 988
              </span>
              <span className="font-sans text-[12px] text-slate">
                US Crisis Line
              </span>
            </a>
          </li>
          <li>
            <a
              href="sms:741741?body=HOME"
              className="flex items-center justify-between py-4 text-left transition hover:text-cyan"
            >
              <span className="font-sans text-[15px] font-semibold text-navy">
                Text HOME to 741741
              </span>
              <span className="font-sans text-[12px] text-slate">
                Crisis Text Line
              </span>
            </a>
          </li>
          <li>
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-4 text-left transition hover:text-cyan"
            >
              <span className="font-sans text-[15px] font-semibold text-navy">
                International resources
              </span>
              <span className="font-sans text-[12px] text-slate">→</span>
            </a>
          </li>
        </ul>
        <p className="mt-10 font-sans text-[13px] text-slate">
          The app will be here when you&apos;re ready.
        </p>
      </main>
    );
  }

  // status === "ask"
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center animate-fade-in">
      <h1 className="font-serif text-[32px] font-medium leading-tight text-navy">
        How are you now?
      </h1>
      <div
        aria-hidden
        className="my-8 h-px w-16 bg-slate/30"
      />
      <div className="flex flex-col items-stretch gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={() => setStatus("better")}
          className="inline-flex items-center justify-center rounded-full bg-cyan px-8 py-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-white hover:bg-navy"
        >
          Better
        </button>
        <button
          type="button"
          onClick={() => setStatus("same")}
          className="inline-flex items-center justify-center rounded-full border border-cyan px-8 py-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-cyan hover:bg-cyan hover:text-white"
        >
          About the same
        </button>
        <button
          type="button"
          onClick={() => setStatus("worse")}
          className="inline-flex items-center justify-center rounded-full border border-slate/40 px-8 py-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-slate hover:border-navy hover:text-navy"
        >
          Worse
        </button>
      </div>
    </main>
  );
}
