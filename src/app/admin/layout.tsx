import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin";
import SiteHeader from "@/components/SiteHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/");
  return (
    <>
      <SiteHeader user={admin} />
      <div className="border-b border-navy/10 bg-mist/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-5 px-6 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em]">
          <span className="text-cyan-deep">Admin</span>
          <Link
            href="/admin/coach-content"
            className="text-navy/70 hover:text-cyan-deep"
          >
            Content studio
          </Link>
        </div>
      </div>
      {children}
    </>
  );
}
