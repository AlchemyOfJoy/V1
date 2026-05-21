"use client";

import { useEffect } from "react";
import Link from "next/link";
import { btnPrimary, btnGhostLight } from "@/lib/ui";

/** App-wide error boundary — graceful recovery for any runtime error. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in server/runtime logs; a hook point for Sentry later.
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
        Something interrupted us
      </p>
      <h1 className="mt-4 font-serif text-[34px] font-medium tracking-tight text-navy">
        That didn&apos;t quite <em className="text-cyan-deep">work</em>.
      </h1>
      <p className="mt-3 max-w-sm font-sans text-[15px] font-light text-navy/65">
        Something went wrong on our end. Your data is safe — try again, or head
        back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button onClick={reset} className={btnPrimary}>
          Try again
        </button>
        <Link href="/" className={btnGhostLight}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
