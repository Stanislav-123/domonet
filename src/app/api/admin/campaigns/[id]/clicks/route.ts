import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, affiliateScope, canSeeAllStats } from "@/lib/api";
import { jsonError } from "@/lib/http";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAdmin();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true, name: true, affiliateId: true },
  });
  if (!campaign) return jsonError("Кампания не найдена", 404);
  if (!canSeeAllStats(session.role) && campaign.affiliateId !== session.id) {
    return jsonError("Нет доступа", 403);
  }

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const take = Math.min(Math.max(Number(url.searchParams.get("take") || 100) || 100, 1), 200);
  const skip = (page - 1) * take;

  const where = { campaignId: id, ...affiliateScope(session) };
  const [clicks, total] = await Promise.all([
    prisma.click.findMany({
      where,
      include: { lander: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.click.count({ where }),
  ]);

  return NextResponse.json({ campaign: { id: campaign.id, name: campaign.name }, clicks, total, page, take });
}
