import { redirect } from "next/navigation";
import { getStudentForCurrentUser } from "@/lib/student-auth";

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getStudentForCurrentUser();
  if (result === null) redirect("/auth/login");
  return <>{children}</>;
}
