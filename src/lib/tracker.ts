import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { makeClickId } from "./ids";
import { lookupCountry } from "./geo";
import { detectBot, parseUa } from "./ua";
import { getCampaignLanderIds } from "./campaigns";
import { getLanderById, getLanderBySlug, listLanders } from "./landers";

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function isOverDailyCap(lander: { id: string; dailyCap: number | null }) {
  if (!lander.dailyCap || lander.dailyCap <= 0) return false;
  const count = await prisma.lead.count({
    where: {
      landerId: lander.id,
      createdAt: { gte: startOfUtcDay() },
      status: { not: "duplicate" },
    },
  });
  return count >= lander.dailyCap;
}

export async function pickLander(opts?: {
  forcedLanderId?: string | null;
  allowedLanderIds?: string[] | null;
}) {
  const allowed = (opts?.allowedLanderIds || []).filter(Boolean);
  const forcedLanderId = allowed.length > 0 ? null : opts?.forcedLanderId;

  if (forcedLanderId) {
    const forced = await getLanderById(forcedLanderId);
    if (forced) return forced;
  }

  const all = await listLanders();
  const landers = allowed.length > 0 ? all.filter((l) => allowed.includes(l.id)) : all;
  if (landers.length === 0) return null;

  const i = Math.floor(Math.random() * landers.length);
  return landers[i] ?? null;
}

export type TrackInput = {
  code?: string | null;
  existingClickId?: string | null;
  ip: string;
  userAgent: string | null;
  referer: string | null;
  headerCountry?: string | null;
  source?: string | null;
  sub1?: string | null;
  sub2?: string | null;
  sub3?: string | null;
  sub4?: string | null;
  sub5?: string | null;
  landerSlug?: string | null;
  locale?: string | null;
};

export async function resolveTracking(input: TrackInput) {
  let link = input.code
    ? await prisma.trackingLink.findUnique({
        where: { code: input.code },
        include: {
          campaign: true,
          affiliate: true,
        },
      })
    : null;

  if (link && !link.active) link = null;

  let lander = null;
  if (input.landerSlug) {
    lander = await getLanderBySlug(input.landerSlug);
  }
  if (!lander) {
    const allowedLanderIds = link ? await getCampaignLanderIds(link.campaignId) : [];
    lander = await pickLander({
      forcedLanderId: link?.landerId,
      allowedLanderIds,
    });
  }
  if (!lander) throw new Error("Нет активных лендов");

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const seen = await prisma.click.findFirst({
    where: {
      ip: input.ip,
      userAgent: input.userAgent || "",
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  const isUnique = !seen;

  const ua = parseUa(input.userAgent);
  const isBot = detectBot(input.userAgent);
  const country = await lookupCountry(input.ip, input.headerCountry);

  const click = await prisma.click.create({
    data: {
      clickId: makeClickId(),
      trackingLinkId: link?.id,
      campaignId: link?.campaignId,
      landerId: lander.id,
      affiliateId: link?.affiliateId,
      ip: input.ip,
      country,
      device: ua.device,
      os: ua.os,
      browser: ua.browser,
      userAgent: input.userAgent || "",
      referer: input.referer,
      source: input.source,
      sub1: input.sub1,
      sub2: input.sub2,
      sub3: input.sub3,
      sub4: input.sub4,
      sub5: input.sub5,
      isBot,
      isUnique,
    },
  });

  return { click, lander, link, reused: !isUnique };
}

export async function recordEvent(data: {
  type: Prisma.EventCreateInput["type"];
  clickId: string;
  landerId?: string | null;
}) {
  const click = await prisma.click.findUnique({ where: { clickId: data.clickId } });
  if (!click) return null;
  return prisma.event.create({
    data: {
      type: data.type,
      clickId: click.clickId,
      landerId: data.landerId ?? click.landerId,
      campaignId: click.campaignId,
      affiliateId: click.affiliateId,
      isBot: click.isBot,
    },
  });
}
