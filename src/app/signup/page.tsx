import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isGoogleEnabled } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";
import BrandLogo from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false },
};

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-12">
        <BrandLogo variant="navy" priority className="h-[26px] w-auto" />
      </Link>
      <AuthForm mode="signup" googleEnabled={isGoogleEnabled()} />
    </main>
  );
}
