import type { Metadata } from "next";
import { listPending } from "@/lib/cert-applications";
import { query } from "@/lib/db";
import CertApplicationsAdmin from "@/components/admin/CertApplicationsAdmin";

export const metadata: Metadata = {
  title: "Cert applications · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CertApplicationsPage() {
  const apps = await listPending();
  // Hydrate email/name for display
  const userIds = apps.map((a) => a.user_id);
  const users =
    userIds.length === 0
      ? []
      : await query<{ id: string; email: string; name: string | null }>(
          `SELECT id, email, name FROM users WHERE id = ANY($1)`,
          [userIds],
        );
  const userMap = new Map(users.map((u) => [u.id, u]));

  const hydrated = apps.map((a) => ({
    ...a,
    email: userMap.get(a.user_id)?.email ?? "—",
    name: userMap.get(a.user_id)?.name ?? null,
    paid_at:
      a.paid_at instanceof Date ? a.paid_at.toISOString() : a.paid_at ?? null,
    created_at:
      a.created_at instanceof Date
        ? a.created_at.toISOString()
        : (a.created_at as string),
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Admin
        </p>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy">
          Cert applications
        </h1>
        <p className="mt-2 font-sans text-[14px] font-light text-navy/65">
          Review and approve aspiring coaches. Approval promotes them to
          coach role + seeds Phase 1.
        </p>
      </header>
      <div className="mt-8">
        <CertApplicationsAdmin initial={hydrated} />
      </div>
    </main>
  );
}
