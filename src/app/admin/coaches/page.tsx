import type { Metadata } from "next";
import { query } from "@/lib/db";
import CoachAdmin from "@/components/admin/CoachAdmin";

export const metadata: Metadata = {
  title: "Coaches · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CoachesAdminPage() {
  const rows = await query<{
    id: string;
    email: string;
    name: string | null;
    cert_status: string | null;
    accepting_clients: boolean | null;
    capacity: number | null;
  }>(
    `SELECT u.id, u.email, u.name, cp.cert_status, cp.accepting_clients, cp.capacity
       FROM users u
       LEFT JOIN coach_profiles cp ON cp.user_id = u.id
      WHERE u.role = 'coach'
      ORDER BY u.created_at DESC`,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Admin
        </p>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy">
          Coaches
        </h1>
        <p className="mt-2 font-sans text-[14px] font-light text-navy/65">
          Promote users to coaches, advance their certification phase,
          toggle whether they&apos;re accepting new clients.
        </p>
      </header>
      <div className="mt-8">
        <CoachAdmin initialCoaches={rows} />
      </div>
    </main>
  );
}
