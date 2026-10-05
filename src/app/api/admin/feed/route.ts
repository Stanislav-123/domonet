import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, affiliateScope } from "@/lib/api";

export async function GET() {
  const { error, session } = await requireAdmin();
  if (error || !session) return error!;
  const scope = affiliateScope(session);
  const [clicks, leads] = await Promise.all([
    prisma.click.findMany({
      where: scope,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        lander: { select: { name: true } },
        affiliate: { select: { login: true } },
      },
    }),
    prisma.lead.findMany({
      where: scope,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        lander: { select: { name: true } },
        affiliate: { select: { login: true } },
      },
    }),
  ]);
  return NextResponse.json({ clicks, leads });
}
