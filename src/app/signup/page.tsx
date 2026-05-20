import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isGoogleEnabled } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="text-2xl">☀️</span>
        <span className="text-lg font-bold text-amber-900">Joy Quotient</span>
      </Link>
      <AuthForm mode="signup" googleEnabled={isGoogleEnabled()} />
    </main>
  );
}
