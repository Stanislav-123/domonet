import { prisma } from "./db";
import { makeLinkCode } from "./ids";

export async function ensureCampaignTrackingLink(campaign: {
  id: string;
  name: string;
  affiliateId: string | null;
}, fallbackAffiliateId: string) {
  const existing = await prisma.trackingLink.findFirst({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, code: true, name: true },
  });
  if (existing) return existing;
  return prisma.trackingLink.create({
    data: {
      code: makeLinkCode(),
      name: campaign.name,
      campaignId: campaign.id,
      affiliateId: campaign.affiliateId || fallbackAffiliateId,
    },
    select: { id: true, code: true, name: true },
  });
}

type LanderOpt = { id: string; name: string; slug: string; active: boolean };

export async function getCampaignLanderIds(campaignId: string) {
  const rows = await prisma.campaignLander.findMany({
    where: { campaignId },
    select: { landerId: true },
  });
  return rows.map((row) => row.landerId);
}

export async function getLandersByCampaignIds(campaignIds: string[]) {
  const map = new Map<string, LanderOpt[]>();
  for (const id of campaignIds) map.set(id, []);
  if (campaignIds.length === 0) return map;

  const rows = await prisma.campaignLander.findMany({
    where: { campaignId: { in: campaignIds } },
    select: { campaignId: true, landerId: true },
  });

  const landerIds = [...new Set(rows.map((row) => row.landerId))];
  if (landerIds.length === 0) return map;

  const landers = await prisma.lander.findMany({
    where: { id: { in: landerIds } },
    select: { id: true, name: true, slug: true, active: true },
  });
  const byId = new Map(landers.map((lander) => [lander.id, lander]));
  for (const row of rows) {
    const lander = byId.get(row.landerId);
    if (lander) map.get(row.campaignId)?.push(lander);
  }
  return map;
}

export async function setCampaignLanders(campaignId: string, landerIds: string[]) {
  await prisma.campaignLander.deleteMany({ where: { campaignId } });
  await prisma.campaignLander.createMany({
    data: landerIds.map((landerId) => ({ campaignId, landerId })),
  });
}

export type CampaignWidget = {
  exitPopup: boolean;
  timedPopup: boolean;
  timedPopupSec: number;
};

export const DEFAULT_WIDGET: CampaignWidget = {
  exitPopup: true,
  timedPopup: false,
  timedPopupSec: 15,
};

export async function ensureCampaignWidgetColumns() {
  // No-op: columns are managed by Prisma migrations now
}

export async function getCampaignWidget(campaignId: string): Promise<CampaignWidget> {
  const row = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { exitPopup: true, timedPopup: true, timedPopupSec: true },
  });
  if (!row) return DEFAULT_WIDGET;
  return {
    exitPopup: row.exitPopup,
    timedPopup: row.timedPopup,
    timedPopupSec: row.timedPopupSec,
  };
}

export async function getCampaignWidgets(campaignIds: string[]) {
  const map = new Map<string, CampaignWidget>();
  for (const id of campaignIds) map.set(id, DEFAULT_WIDGET);
  if (campaignIds.length === 0) return map;

  const rows = await prisma.campaign.findMany({
    where: { id: { in: campaignIds } },
    select: { id: true, exitPopup: true, timedPopup: true, timedPopupSec: true },
  });
  for (const row of rows) {
    map.set(row.id, {
      exitPopup: row.exitPopup,
      timedPopup: row.timedPopup,
      timedPopupSec: row.timedPopupSec,
    });
  }
  return map;
}

export async function setCampaignWidget(campaignId: string, widget: CampaignWidget) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      exitPopup: widget.exitPopup,
      timedPopup: widget.timedPopup,
      timedPopupSec: widget.timedPopupSec,
    },
  });
}
