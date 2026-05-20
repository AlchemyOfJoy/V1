import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isGoogleEnabled } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";
import JoyMark from "@/components/JoyMark";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-10 flex items-center gap-2">
        <JoyMark size={20} />
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          Joy Quotient
        </span>
      </Link>
      <AuthForm mode="signup" googleEnabled={isGoogleEnabled()} />
    </main>
  );
}
