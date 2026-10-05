import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, affiliateScope, canSeeAllStats } from "@/lib/api";
import { jsonError } from "@/lib/http";
import { csvResponse } from "@/lib/csv";

export async function GET(
  _req: NextRequest,
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

  const where = { campaignId: id, ...affiliateScope(session) };

  async function* rows() {
    let cursor: string | undefined;
    for (;;) {
      const batch = await prisma.lead.findMany({
        where,
        take: 500,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: "asc" },
        include: {
          lander: { select: { name: true } },
          click: {
            select: {
              clickId: true,
              ip: true,
              country: true,
              device: true,
              os: true,
              browser: true,
              userAgent: true,
              referer: true,
              source: true,
            },
          },
        },
      });
      if (batch.length === 0) break;
      for (const l of batch) {
        yield [
          l.createdAt.toISOString(),
          l.name,
          l.lastName,
          l.email,
          l.phone,
          l.status,
          l.country || l.click?.country || "",
          l.ip || l.click?.ip || "",
          l.device || l.click?.device || "",
          l.click?.os || "",
          l.click?.browser || "",
          l.lander.name,
          l.click?.referer || "",
          l.click?.userAgent || "",
          l.click?.clickId || "",
        ];
      }
      cursor = batch[batch.length - 1]?.id;
      if (!cursor) break;
    }
  }

  return csvResponse(`campaign-${id}-leads.csv`, [
    "createdAt",
    "firstName",
    "lastName",
    "email",
    "phone",
    "status",
    "country",
    "ip",
    "device",
    "os",
    "browser",
    "lander",
    "referer",
    "userAgent",
    "clickId",
  ], rows());
}
