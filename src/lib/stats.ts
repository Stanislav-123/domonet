import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { listLanders } from "./landers";

export type StatsFilter = {
  from: Date;
  to: Date;
  affiliateId?: string;
  campaignId?: string;
  landerId?: string;
  includeBots?: boolean;
};

function clickWhere(f: StatsFilter): Prisma.ClickWhereInput {
  return {
    createdAt: { gte: f.from, lte: f.to },
    ...(f.affiliateId ? { affiliateId: f.affiliateId } : {}),
    ...(f.campaignId ? { campaignId: f.campaignId } : {}),
    ...(f.landerId ? { landerId: f.landerId } : {}),
    ...(f.includeBots ? {} : { isBot: false }),
  };
}

function eventWhere(f: StatsFilter): Prisma.EventWhereInput {
  return {
    createdAt: { gte: f.from, lte: f.to },
    ...(f.affiliateId ? { affiliateId: f.affiliateId } : {}),
    ...(f.campaignId ? { campaignId: f.campaignId } : {}),
    ...(f.landerId ? { landerId: f.landerId } : {}),
    ...(f.includeBots ? {} : { isBot: false }),
  };
}

function leadWhere(f: StatsFilter): Prisma.LeadWhereInput {
  return {
    createdAt: { gte: f.from, lte: f.to },
    ...(f.affiliateId ? { affiliateId: f.affiliateId } : {}),
    ...(f.campaignId ? { campaignId: f.campaignId } : {}),
    ...(f.landerId ? { landerId: f.landerId } : {}),
  };
}

export function cr(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 10000) / 100;
}

export async function countUniques(where: Prisma.ClickWhereInput) {
  const groups = await prisma.click.groupBy({
    by: ["ip", "userAgent"],
    where,
  });
  return groups.length;
}

export async function getOverview(f: StatsFilter) {
  const whereClick = clickWhere(f);
  const [clicks, uniques, eventGroups, leadGroups] = await Promise.all([
    prisma.click.count({ where: whereClick }),
    countUniques(whereClick),
    prisma.event.groupBy({
      by: ["type"],
      where: eventWhere(f),
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: leadWhere(f),
      _count: { _all: true },
    }),
  ]);

  const events: Record<string, number> = {};
  for (const row of eventGroups) events[row.type] = row._count._all;

  const leadsByStatus: Record<string, number> = {};
  for (const row of leadGroups) leadsByStatus[row.status] = row._count._all;

  const leads = Object.values(leadsByStatus).reduce((s, n) => s + n, 0);
  const confirmed = leadsByStatus.confirmed ?? 0;
  const duplicates = leadsByStatus.duplicate ?? 0;
  const landViews = events.land_view ?? 0;

  return {
    clicks,
    uniques,
    backButton: events.back_button ?? 0,
    exitShown: events.exit_shown ?? 0,
    exitClosed: events.exit_closed ?? 0,
    exitClicked: events.exit_clicked ?? 0,
    landViews,
    formStarts: events.form_start ?? 0,
    leads,
    confirmed,
    rejected: leadsByStatus.rejected ?? 0,
    duplicates,
    crClickToLead: cr(leads, clicks),
    crLandToLead: cr(leads, landViews),
    crClickToConfirmed: cr(confirmed, clicks),
    uniqueToLead: cr(leads, uniques),
    sales: confirmed,
    crLeadToSale: cr(confirmed, leads),
  };
}

export async function getLanderStats(f: StatsFilter) {
  const landers = await listLanders();
  const rows = await Promise.all(
    landers.map(async (lander) => {
      const scoped = { ...f, landerId: lander.id };
      const overview = await getOverview(scoped);
      return { lander: { id: lander.id, name: lander.name }, ...overview };
    }),
  );
  return rows;
}

export async function getBreakdown(
  f: StatsFilter,
  field: "country" | "device" | "affiliateId" | "campaignId",
) {
  const groups = await prisma.click.groupBy({
    by: [field],
    where: clickWhere(f),
    _count: { _all: true },
  });

  const leadGroups = await prisma.lead.groupBy({
    by: [field === "device" ? "device" : field],
    where: leadWhere(f),
    _count: { _all: true },
  });

  const leadMap = new Map<string, number>();
  for (const row of leadGroups) {
    const key = String(row[field === "device" ? "device" : field] ?? "unknown");
    leadMap.set(key, row._count._all);
  }

  return groups
    .map((row) => {
      const key = String(row[field] ?? "unknown");
      const clicks = row._count._all;
      const leads = leadMap.get(key) ?? 0;
      return { key, clicks, leads, cr: cr(leads, clicks) };
    })
    .sort((a, b) => b.clicks - a.clicks);
}

export async function getDailySeries(f: StatsFilter) {
  const [clicks, leads] = await Promise.all([
    prisma.click.findMany({
      where: clickWhere(f),
      select: { createdAt: true },
    }),
    prisma.lead.findMany({
      where: leadWhere(f),
      select: { createdAt: true, status: true },
    }),
  ]);

  const days = new Map<
    string,
    { date: string; clicks: number; leads: number; confirmed: number }
  >();
  const cursor = new Date(f.from);
  while (cursor <= f.to) {
    const key = cursor.toISOString().slice(0, 10);
    days.set(key, { date: key, clicks: 0, leads: 0, confirmed: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  for (const c of clicks) {
    const key = c.createdAt.toISOString().slice(0, 10);
    const row = days.get(key);
    if (row) row.clicks += 1;
  }
  for (const l of leads) {
    const key = l.createdAt.toISOString().slice(0, 10);
    const row = days.get(key);
    if (row) {
      row.leads += 1;
      if (l.status === "confirmed") row.confirmed += 1;
    }
  }
  return [...days.values()];
}

export async function getLanderGeoStats(f: StatsFilter) {
  const [clicks, leads, landers] = await Promise.all([
    prisma.click.findMany({
      where: clickWhere(f),
      select: { landerId: true, country: true, ip: true, userAgent: true },
    }),
    prisma.lead.findMany({
      where: leadWhere(f),
      select: { landerId: true, country: true, status: true },
    }),
    listLanders(),
  ]);

  type Acc = { clicks: number; visitors: Set<string>; leads: number; sales: number };
  const map = new Map<string, Acc>();

  function bucket(landerId: string | null, country: string | null) {
    const key = `${landerId || ""}|${country || "??"}`;
    let row = map.get(key);
    if (!row) {
      row = { clicks: 0, visitors: new Set(), leads: 0, sales: 0 };
      map.set(key, row);
    }
    return row;
  }

  for (const c of clicks) {
    const row = bucket(c.landerId, c.country);
    row.clicks += 1;
    row.visitors.add(`${c.ip}|${c.userAgent || ""}`);
  }
  for (const l of leads) {
    const row = bucket(l.landerId, l.country);
    row.leads += 1;
    if (l.status === "confirmed") row.sales += 1;
  }

  const names = new Map(landers.map((l) => [l.id, l.name]));
  return [...map.entries()]
    .map(([key, row]) => {
      const [landerId, country] = key.split("|");
      const uniques = row.visitors.size;
      return {
        landerId: landerId || null,
        landerName: names.get(landerId || "") || "—",
        country: country || "??",
        clicks: row.clicks,
        uniques,
        leads: row.leads,
        uniqueToLead: cr(row.leads, uniques),
        sales: row.sales,
        cr: cr(row.sales, row.leads),
      };
    })
    .sort((a, b) => b.clicks - a.clicks);
}

export function defaultRange(days = 7) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to };
}
