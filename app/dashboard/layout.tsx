import { CedarShell } from "./CedarShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CedarShell>{children}</CedarShell>;
}
