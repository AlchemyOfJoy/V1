import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import BottomNav from "./BottomNav";
import StuckPrompt from "./StuckPrompt";
import OfflineSync from "./OfflineSync";

/**
 * AppShell — wraps every signed-in app surface (Flow Overhaul §2.2).
 *
 *   • Top SiteHeader (logo + Help "?" + sign out)
 *   • Main content
 *   • BottomNav: [Today] [⚡ Reset Breath] [≡ Switchboard]
 *
 * The five-tab nav and persistent floating [+] are gone. Browse, Tools,
 * Library, Coach, Me — all one tap into the Switchboard. The List of
 * Joy add lives inside the Daily Session and as a PWA shortcut.
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
      <main className="min-h-[calc(100vh-4rem-4rem)] pb-[calc(72px+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav />
      <StuckPrompt />
      <OfflineSync />
    </>
  );
}
