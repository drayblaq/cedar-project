import { CedarShell } from "@/app/dashboard/CedarShell";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <CedarShell>{children}</CedarShell>;
}
