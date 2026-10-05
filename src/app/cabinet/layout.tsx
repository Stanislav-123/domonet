import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CabinetShell } from "@/components/cabinet/CabinetShell";

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <CabinetShell user={session}>
      {children}
    </CabinetShell>
  );
}
