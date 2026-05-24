import type { Metadata } from "next";
import NewCourseForm from "@/components/admin/NewCourseForm";

export const metadata: Metadata = {
  title: "New course · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default function NewCoursePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Admin · New course
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-navy">
          Start a new course
        </h1>
        <p className="mt-2 font-sans text-[14px] font-light text-navy/65">
          We&apos;ll create it as a draft. You can add modules and lessons next.
        </p>
      </header>
      <div className="mt-8">
        <NewCourseForm />
      </div>
    </main>
  );
}
