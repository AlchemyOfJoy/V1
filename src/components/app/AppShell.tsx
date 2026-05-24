import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import TabBar, { SideRail } from "./TabBar";
import FloatingActions from "./FloatingActions";
import StuckPrompt from "./StuckPrompt";
import OfflineSync from "./OfflineSync";

/**
 * AppShell — wraps every signed-in app surface in:
 *   • Top SiteHeader (logo, Companion link, Admin link if applicable, sign out)
 *   • Side rail (desktop) + bottom tab bar (mobile)
 *   • Persistent floating [+] List of Joy and [⚡] Reset Breath buttons
 *
 * Pages just render their content children; the shell handles chrome.
 * Celebration + Sacred Work providers are at root layout so curriculum
 * routes (which use their own layout) can fire celebrations too.
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
      <div className="flex min-h-[calc(100vh-4rem)]">
        <SideRail />
        <main className="min-w-0 flex-1 pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </main>
      </div>
      <TabBar />
      <FloatingActions />
      <StuckPrompt />
      <OfflineSync />
    </>
  );
}
