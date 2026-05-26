import AppShell from "@/components/app/AppShell";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
