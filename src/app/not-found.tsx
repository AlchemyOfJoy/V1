import Link from "next/link";
import { btnPrimary } from "@/lib/ui";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.26em] text-cyan">
        Error 404
      </p>
      <h1 className="mt-4 font-serif text-[34px] font-medium tracking-tight text-navy">
        We couldn&apos;t find <em className="text-cyan">that page</em>.
      </h1>
      <p className="mt-3 max-w-sm font-sans text-[15px] font-light text-navy/65">
        The page you&apos;re looking for may have moved or never existed.
      </p>
      <Link href="/" className={`${btnPrimary} mt-8`}>
        Back to home
      </Link>
    </main>
  );
}
