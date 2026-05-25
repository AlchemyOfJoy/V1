import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { lookupResetToken } from "@/lib/password-reset";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? await lookupResetToken(token) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-12">
        <BrandLogo variant="navy" priority className="h-[26px] w-auto" />
      </Link>
      {valid ? (
        <ResetPasswordForm token={token!} />
      ) : (
        <div className="w-full max-w-[380px] animate-fade-in">
          <h1 className="font-serif text-[28px] font-medium leading-tight tracking-tight text-navy">
            This link has <em className="text-cyan-deep">expired</em>.
          </h1>
          <p className="mt-3 font-serif text-[16px] italic leading-relaxed text-navy/65">
            Reset links are only good for an hour and can be used once.
            Request a fresh one.
          </p>
          <Link
            href="/forgot-password"
            className="mt-7 inline-block rounded-full bg-cyan-deep px-5 py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-[#006a8c]"
          >
            Send a new link →
          </Link>
        </div>
      )}
    </main>
  );
}
