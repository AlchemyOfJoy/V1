import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isGoogleEnabled } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";
import Monogram from "@/components/Monogram";

const ERRORS: Record<string, string> = {
  google_unavailable: "Google sign-in isn't set up on this server.",
  google_state: "That Google sign-in expired — try again?",
  google_token: "Google sign-in didn't complete — try again?",
  google_profile: "We couldn't read your Google profile — try again?",
  google_error: "Something didn't work with Google sign-in — try again?",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-12 flex items-center gap-2.5 text-navy"
      >
        <Monogram size={24} />
        <span className="font-serif text-[20px] font-medium tracking-tight">
          Joy Quotient
        </span>
      </Link>
      <AuthForm
        mode="login"
        googleEnabled={isGoogleEnabled()}
        initialError={error ? ERRORS[error] : undefined}
      />
    </main>
  );
}
