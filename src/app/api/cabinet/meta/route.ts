import { requireApiUser } from "@/lib/api";
import { canSeeAllStats } from "@/lib/roles";
import { listLanders } from "@/lib/landers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const landers = (await listLanders())
    .filter((l) => l.active)
    .map((l) => ({ id: l.id, name: l.name, slug: l.slug, type: l.type }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const campaigns = await prisma.campaign.findMany({
    where: canSeeAllStats(session.role)
      ? { active: true }
      : { affiliateId: session.id, active: true },
    select: { id: true, name: true },
  });
  return NextResponse.json({ landers, campaigns });
}
