import { CedarShell } from "@/app/dashboard/CedarShell";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <CedarShell>{children}</CedarShell>;
}
