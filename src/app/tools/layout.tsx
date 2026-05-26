import AppShell from "@/components/app/AppShell";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
