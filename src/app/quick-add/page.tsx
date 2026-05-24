import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import QuickAddClient from "./QuickAddClient";

export const metadata: Metadata = {
  title: "Add a joy",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * The home-screen shortcut target (Build Directive §2.2 #5).
 *
 * Long-pressing the installed PWA icon and tapping "Add a joy" launches
 * this route. It mounts a focused full-screen quick-add surface — no
 * tab bar distractions, no scrolling past — and routes back Home on
 * submit. Behaves identically to the [+] floating action, but is
 * deep-linkable so the OS-level shortcut works.
 */
export default async function QuickAddPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/quick-add");
  return <QuickAddClient />;
}
