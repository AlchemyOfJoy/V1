import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import OfflineSync from "./OfflineSync";

/**
 * AppShell — wraps every signed-in app surface (Synthesis Spec §7).
 *
 * No tab bar. No floating buttons. No persistent chrome other than
 * the top SiteHeader (which now carries the 💬 BrentBot icon top-
 * right). Navigation is intentional: open the app → home (intention)
 * → today's practice → BrentBot if needed → done.
 */
export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <>
      <SiteHeader user={user} />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <OfflineSync />
    </>
  );
}
