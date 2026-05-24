import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";

export const metadata: Metadata = {
  title: "Certificate",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface Row {
  verification_code: string;
  issued_at: string | Date;
  course_title: string;
  student_name: string | null;
  student_email: string;
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const rows = await query<Row>(
    `SELECT cc.verification_code, cc.issued_at,
            c.title AS course_title,
            u.name AS student_name, u.email AS student_email
       FROM course_certificates cc
       JOIN course_enrollments ce ON ce.id = cc.enrollment_id
       JOIN courses c ON c.id = ce.course_id
       JOIN users u ON u.id = ce.user_id
       WHERE cc.verification_code = $1`,
    [code.toUpperCase()],
  );
  const cert = rows[0];
  if (!cert) notFound();

  const issued = new Date(cert.issued_at);
  return (
    <main className="min-h-screen bg-[#F7F2E9] px-6 py-12 print:bg-white print:py-0">
      <article className="mx-auto max-w-2xl rounded-3xl border border-[#C89A3F]/40 bg-white p-10 text-center shadow-[0_2px_24px_rgba(200,154,63,0.08)] print:border-0 print:shadow-none">
        <p aria-hidden className="text-[40px] text-[#C89A3F]">
          ✦
        </p>
        <p className="mt-3 font-sans text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8a6d00]">
          Certificate of completion
        </p>
        <h1 className="mt-6 font-serif text-[24px] font-medium text-navy">
          This certifies that
        </h1>
        <p className="mt-3 font-serif text-[36px] font-medium leading-tight text-navy">
          {cert.student_name ?? cert.student_email}
        </p>
        <p className="mt-6 font-serif text-[20px] italic text-navy/65">
          has completed
        </p>
        <p className="mt-3 font-serif text-[28px] font-medium leading-tight text-navy">
          {cert.course_title}
        </p>
        <p className="mt-8 font-sans text-[12px] uppercase tracking-[0.22em] text-navy/55">
          Issued{" "}
          {issued.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.22em] text-navy/35">
          The Alchemy of Joy · BJF
        </p>
        <p className="mt-2 font-mono text-[10px] text-navy/40">
          Verification: {cert.verification_code}
        </p>
        <div className="mt-8 flex justify-center gap-3 print:hidden">
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="rounded-full border border-navy/20 px-5 py-2 font-sans text-[13px] font-medium text-navy hover:border-cyan-deep hover:text-cyan-deep"
          >
            Print
          </button>
          <Link
            href="/me"
            className="rounded-full bg-cyan-deep px-5 py-2 font-sans text-[13px] font-semibold text-white hover:bg-[#006a8c]"
          >
            Back to Me
          </Link>
        </div>
      </article>
    </main>
  );
}
