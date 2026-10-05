import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser, affiliateScope } from "@/lib/api";
import { ensureCampaignTrackingLink, getCampaignWidgets, getLandersByCampaignIds } from "@/lib/campaigns";
import { jsonError } from "@/lib/http";
import { z } from "zod";

export async function GET() {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  try {
    const campaigns = await prisma.campaign.findMany({
      where: affiliateScope(session),
      include: {
        affiliate: { select: { login: true, name: true } },
        trackingLinks: {
          select: { id: true, code: true, name: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { trackingLinks: true, clicks: true, leads: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const landerMap = await getLandersByCampaignIds(campaigns.map((c) => c.id));
    const widgetMap = await getCampaignWidgets(campaigns.map((c) => c.id));
    const result = [];
    for (const campaign of campaigns) {
      const trackingLinks =
        campaign.trackingLinks.length > 0
          ? campaign.trackingLinks
          : [await ensureCampaignTrackingLink(campaign, session.id)];
      result.push({
        ...campaign,
        trackingLinks,
        landers: landerMap.get(campaign.id) || [],
        widget: widgetMap.get(campaign.id),
        _count: { ...campaign._count, trackingLinks: trackingLinks.length },
      });
    }
    return NextResponse.json({ campaigns: result });
  } catch (e) {
    console.error(e);
    return jsonError(e instanceof Error ? e.message : "Не удалось загрузить кампании", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const parsed = z
    .object({
      name: z.string().min(2),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Введите название кампании");
  const campaign = await prisma.campaign.create({
    data: {
      name: parsed.data.name,
      affiliateId: session.id,
    },
  });
  const link = await ensureCampaignTrackingLink(campaign, session.id);
  return NextResponse.json({ campaign, link });
}
