import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-12">
        <BrandLogo variant="navy" priority className="h-[26px] w-auto" />
      </Link>
      <ForgotPasswordForm />
    </main>
  );
}
