import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import BottomNav from "./BottomNav";
import ResetBreathButton from "./ResetBreathButton";
import OfflineSync from "./OfflineSync";

/**
 * AppShell — per UI/UX Overhaul §0:
 *
 *   • Top SiteHeader (logo + sign out)
 *   • Main content
 *   • BottomNav: TODAY · THE BOOK · MY ALCHEMY (the ONLY navigation)
 *   • Floating ⚡ Reset Breath (tap = 60s, long-press = Right Now)
 *
 * No StuckPrompt, no Help button, no Switchboard, no FAB for List of
 * Joy. The directive's deletion checklist is enforced here.
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
      <ResetBreathButton />
      <OfflineSync />
    </>
  );
}
