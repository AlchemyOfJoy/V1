import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isGoogleEnabled } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

const ERRORS: Record<string, string> = {
  google_unavailable: "Google sign-in is not configured on this server.",
  google_state: "Google sign-in expired. Please try again.",
  google_token: "Could not complete Google sign-in. Please try again.",
  google_profile: "Could not read your Google profile. Please try again.",
  google_error: "Something went wrong with Google sign-in.",
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
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="text-2xl">☀️</span>
        <span className="text-lg font-bold text-amber-900">Joy Quotient</span>
      </Link>
      <AuthForm
        mode="login"
        googleEnabled={isGoogleEnabled()}
        initialError={error ? ERRORS[error] : undefined}
      />
    </main>
  );
}
