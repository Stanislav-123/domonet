import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session?.role !== "owner") redirect("/admin");
  return <>{children}</>;
}
