import AppShell from "@/components/app/AppShell";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
