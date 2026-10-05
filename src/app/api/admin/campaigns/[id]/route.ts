import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { canSeeAllStats } from "@/lib/roles";
import {
  DEFAULT_WIDGET,
  getCampaignLanderIds,
  getCampaignWidget,
  setCampaignLanders,
  setCampaignWidget,
} from "@/lib/campaigns";
import { jsonError } from "@/lib/http";
import { z } from "zod";

async function requireCampaignAccess(session: { id: string; role: import("@prisma/client").Role }, campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true, affiliateId: true } });
  if (!campaign) return { campaign: null, error: jsonError("Кампания не найдена", 404) };
  if (!canSeeAllStats(session.role) && campaign.affiliateId !== session.id) {
    return { campaign: null, error: jsonError("Нет доступа", 403) };
  }
  return { campaign, error: null };
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  const access = await requireCampaignAccess(session, id);
  if (access.error) return access.error;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      affiliate: { select: { login: true, name: true } },
      trackingLinks: {
        select: { id: true, code: true, name: true },
        orderBy: { createdAt: "asc" },
      },
      integrations: {
        select: { integrationId: true, weight: true },
      },
    },
  });
  if (!campaign) return jsonError("Кампания не найдена", 404);
  const [landerIds, widget] = await Promise.all([getCampaignLanderIds(id), getCampaignWidget(id)]);
  return NextResponse.json({ campaign: { ...campaign, landerIds, widget } });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  const access = await requireCampaignAccess(session, id);
  if (access.error) return access.error;

  const parsed = z
    .object({
      name: z.string().min(2).optional(),
      active: z.boolean().optional(),
      landerIds: z.array(z.string().min(1)).optional(),
      exitPopup: z.boolean().optional(),
      timedPopup: z.boolean().optional(),
      timedPopupSec: z.number().int().min(1).max(3600).optional(),
      integrations: z.array(z.object({
        integrationId: z.string().min(1),
        weight: z.number().int().min(1).max(10000).default(100),
      })).optional(),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Некорректные данные");

  const { landerIds, exitPopup, timedPopup, timedPopupSec, integrations, ...fields } = parsed.data;

  if (landerIds) {
    const uniqueIds = [...new Set(landerIds)];
    if (uniqueIds.length === 0) return jsonError("Оставьте хотя бы один ленд");
    const rows = await prisma.lander.findMany({ select: { id: true } });
    const known = new Set(rows.map((row) => row.id));
    if (uniqueIds.some((landerId) => !known.has(landerId))) return jsonError("Некорректные ленды");
    await setCampaignLanders(id, uniqueIds);
  }

  if (exitPopup !== undefined || timedPopup !== undefined || timedPopupSec !== undefined) {
    const current = await getCampaignWidget(id);
    await setCampaignWidget(id, {
      exitPopup: exitPopup ?? current.exitPopup,
      timedPopup: timedPopup ?? current.timedPopup,
      timedPopupSec: timedPopupSec ?? current.timedPopupSec ?? DEFAULT_WIDGET.timedPopupSec,
    });
  }

  if (integrations !== undefined) {
    if (integrations.length > 0) {
      const uniqueIntIds = [...new Set(integrations.map((i) => i.integrationId))];
      const allowed = await prisma.integration.findMany({
        where: canSeeAllStats(session.role)
          ? { id: { in: uniqueIntIds }, active: true }
          : {
              id: { in: uniqueIntIds },
              active: true,
              users: { some: { userId: session.id } },
            },
        select: { id: true },
      });
      if (allowed.length !== uniqueIntIds.length) {
        return jsonError("Выбрана недоступная интеграция", 403);
      }
    }
    await prisma.campaignIntegration.deleteMany({ where: { campaignId: id } });
    if (integrations.length > 0) {
      await prisma.campaignIntegration.createMany({
        data: integrations.map((i) => ({ campaignId: id, integrationId: i.integrationId, weight: i.weight })),
      });
    }
  }

  const campaign = Object.keys(fields).length
    ? await prisma.campaign.update({ where: { id }, data: fields })
    : await prisma.campaign.findUnique({ where: { id } });
  return NextResponse.json({ campaign, widget: await getCampaignWidget(id) });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  const access = await requireCampaignAccess(session, id);
  if (access.error) return access.error;
  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
