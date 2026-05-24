import AppShell from "@/components/app/AppShell";

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
