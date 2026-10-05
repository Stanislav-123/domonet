import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api";
import { canSeeAllStats } from "@/lib/roles";
import { jsonError } from "@/lib/http";
import { defaultRange, getBreakdown, getDailySeries, getLanderGeoStats, getLanderStats, getOverview } from "@/lib/stats";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;

  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days") || 7);
  const range = defaultRange(Number.isFinite(days) ? days : 7);
  const from = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!) : range.from;
  const to = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!) : range.to;

  const filter = {
    from,
    to,
    affiliateId: canSeeAllStats(session.role)
      ? url.searchParams.get("affiliateId") || undefined
      : session.id,
    campaignId: url.searchParams.get("campaignId") || undefined,
    landerId: url.searchParams.get("landerId") || undefined,
  };

  try {
    const [overview, landers, countries, devices, daily, landerGeo] = await Promise.all([
      getOverview(filter),
      getLanderStats(filter),
      getBreakdown(filter, "country"),
      getBreakdown(filter, "device"),
      getDailySeries(filter),
      getLanderGeoStats(filter),
    ]);

    let affiliates: { key: string; clicks: number; leads: number; cr: number; name?: string }[] = [];
    if (canSeeAllStats(session.role)) {
      affiliates = await getBreakdown(filter, "affiliateId");
      const users = await prisma.user.findMany({
        where: { id: { in: affiliates.map((a) => a.key).filter((k) => k !== "unknown") } },
        select: { id: true, name: true, login: true },
      });
      const map = new Map(users.map((u) => [u.id, u.name || u.login]));
      affiliates = affiliates.map((a) => ({ ...a, name: map.get(a.key) || a.key }));
    }

    return NextResponse.json({ overview, landers, countries, devices, affiliates, daily, landerGeo, from, to });
  } catch (e) {
    console.error(e);
    return jsonError(e instanceof Error ? e.message : "Не удалось загрузить сводку", 500);
  }
}
