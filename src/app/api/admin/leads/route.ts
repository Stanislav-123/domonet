import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser, affiliateScope } from "@/lib/api";
import { LeadStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as LeadStatus | null;
  const landerId = url.searchParams.get("landerId") || undefined;
  const q = url.searchParams.get("q") || undefined;
  const country = url.searchParams.get("country") || undefined;
  const take = Math.min(Number(url.searchParams.get("take") || 50), 200);

  const leads = await prisma.lead.findMany({
    where: {
      ...affiliateScope(session),
      ...(status ? { status } : {}),
      ...(landerId ? { landerId } : {}),
      ...(country ? { country } : {}),
      ...(q
        ? {
            OR: [
              { email: { contains: q } },
              { phone: { contains: q } },
              { name: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      lander: { select: { name: true, slug: true } },
      affiliate: { select: { name: true, login: true } },
      campaign: { select: { name: true } },
      click: { select: { country: true, device: true, sub1: true, source: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
  return NextResponse.json({ leads });
}
