import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import BottomNav from "./BottomNav";
import ResetBreathButton from "./ResetBreathButton";
import StuckPrompt from "./StuckPrompt";
import OfflineSync from "./OfflineSync";

/**
 * AppShell — wraps every signed-in app surface per the Master Prompt §5.
 *
 *   • Top SiteHeader (logo + help + sign out)
 *   • Main content
 *   • BottomNav: TODAY · THE BOOK · MY ALCHEMY (three tabs only)
 *   • Floating ⚡ Reset Breath, long-press → Right Now sheet
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
      <StuckPrompt />
      <OfflineSync />
    </>
  );
}
