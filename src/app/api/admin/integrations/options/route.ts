import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { canSeeAllStats } from "@/lib/roles";

export async function GET() {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;

  const integrations = await prisma.integration.findMany({
    where: canSeeAllStats(session.role)
      ? { active: true }
      : {
          active: true,
          users: { some: { userId: session.id } },
        },
    select: { id: true, name: true, active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ integrations });
}
