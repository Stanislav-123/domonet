import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { canSeeAllStats } from "@/lib/roles";
import { jsonError } from "@/lib/http";
import { makeLinkCode } from "@/lib/ids";
import { z } from "zod";

export async function GET() {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const links = await prisma.trackingLink.findMany({
    where: canSeeAllStats(session.role) ? {} : { affiliateId: session.id },
    include: {
      campaign: true,
      lander: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const parsed = z
    .object({
      name: z.string().min(2),
      campaignId: z.string().optional(),
      landerId: z.string().min(1),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Проверьте поля ссылки");

  let campaignId = parsed.data.campaignId;
  if (!campaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: { affiliateId: session.id },
    });
    if (!campaign) return jsonError("Нет кампании");
    campaignId = campaign.id;
  } else if (!canSeeAllStats(session.role)) {
    const own = await prisma.campaign.findFirst({
      where: { id: campaignId, affiliateId: session.id },
    });
    if (!own) return jsonError("Чужая кампания", 403);
  }

  const link = await prisma.trackingLink.create({
    data: {
      code: makeLinkCode(),
      name: parsed.data.name,
      campaignId,
      landerId: parsed.data.landerId,
      affiliateId: session.id,
    },
  });
  return NextResponse.json({ link });
}
