import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { canSeeAllStats } from "@/lib/roles";
import { jsonError } from "@/lib/http";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const { id } = await ctx.params;

  const campaign = await prisma.campaign.findUnique({ where: { id }, select: { id: true, affiliateId: true } });
  if (!campaign) return jsonError("Кампания не найдена", 404);
  if (!canSeeAllStats(session.role) && campaign.affiliateId !== session.id) {
    return jsonError("Нет доступа", 403);
  }

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const take = Math.min(200, Math.max(1, Number(url.searchParams.get("take")) || 50));
  const skip = (page - 1) * take;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where: { click: { campaignId: id } },
      include: {
        lander: { select: { name: true, slug: true } },
        click: { select: { clickId: true, ip: true, device: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.lead.count({ where: { click: { campaignId: id } } }),
  ]);

  return NextResponse.json({ leads, total, page, take });
}
