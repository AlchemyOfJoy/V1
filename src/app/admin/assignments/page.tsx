import type { Metadata } from "next";
import { query } from "@/lib/db";
import AssignmentsAdmin from "@/components/admin/AssignmentsAdmin";

export const metadata: Metadata = {
  title: "Assignments · Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const [users, coaches, waitlist] = await Promise.all([
    query<{ id: string; email: string; name: string | null; coach_id: string | null }>(
      `SELECT id, email, name, coach_id FROM users
         WHERE role = 'user'
         ORDER BY created_at DESC
         LIMIT 200`,
    ),
    query<{ id: string; email: string; name: string | null }>(
      `SELECT u.id, u.email, u.name
         FROM users u
         JOIN coach_profiles cp ON cp.user_id = u.id
        WHERE cp.cert_status = 'certified'
        ORDER BY u.name ASC NULLS LAST`,
    ),
    query<{
      id: string;
      email: string;
      package_id: string | null;
      notes: string | null;
      created_at: string | Date;
    }>(
      `SELECT id::text AS id, email, package_id, notes, created_at
         FROM coaching_waitlist
         WHERE status = 'waiting'
         ORDER BY created_at DESC`,
    ),
  ]);

  const hydratedWaitlist = waitlist.map((w) => ({
    ...w,
    created_at:
      w.created_at instanceof Date ? w.created_at.toISOString() : (w.created_at as string),
  }));

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-10">
      <header>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-deep">
          Admin
        </p>
        <h1 className="mt-2 font-serif text-[36px] font-medium leading-tight tracking-tight text-navy">
          Assignments
        </h1>
        <p className="mt-2 font-sans text-[14px] font-light text-navy/65">
          Pair a user with a certified coach. Until the matching
          algorithm ships, this is the manual path.
        </p>
      </header>

      <AssignmentsAdmin
        users={users}
        coaches={coaches}
        waitlist={hydratedWaitlist}
      />
    </main>
  );
}
