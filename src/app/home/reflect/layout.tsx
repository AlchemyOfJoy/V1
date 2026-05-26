import AppShell from "@/components/app/AppShell";

export default function ReflectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
