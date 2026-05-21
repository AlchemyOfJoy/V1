import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isGoogleEnabled } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";
import Monogram from "@/components/Monogram";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-12 flex items-center gap-2.5 text-navy">
        <Monogram size={24} />
        <span className="font-serif text-[20px] font-medium tracking-tight">
          Joy Quotient
        </span>
      </Link>
      <AuthForm mode="signup" googleEnabled={isGoogleEnabled()} />
    </main>
  );
}
