import type { Metadata } from "next";
import ContentForm from "@/components/admin/ContentForm";

export const metadata: Metadata = {
  title: "Add content · Admin",
  robots: { index: false },
};

export default function NewContentPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Content Studio · New
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-navy">
          Add a piece
        </h1>
      </header>
      <div className="mt-8">
        <ContentForm />
      </div>
    </main>
  );
}
