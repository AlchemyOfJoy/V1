import AppShell from "@/components/app/AppShell";

export default function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
