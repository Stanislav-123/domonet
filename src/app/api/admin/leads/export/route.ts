import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, affiliateScope } from "@/lib/api";
import { csvResponse } from "@/lib/csv";
import type { LeadStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error || !session) return error!;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as LeadStatus | null;
  const landerId = url.searchParams.get("landerId") || undefined;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: Prisma.LeadWhereInput = {
    ...affiliateScope(session),
    ...(status ? { status } : {}),
    ...(landerId ? { landerId } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

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
          affiliate: { select: { login: true } },
          click: { select: { country: true, device: true, sub1: true, sub2: true, source: true, clickId: true } },
        },
      });
      if (batch.length === 0) break;
      for (const l of batch) {
        yield [
          l.createdAt.toISOString(),
          l.status,
          l.name,
          l.lastName,
          l.email,
          l.phone,
          l.country || "",
          l.lander.name,
          l.affiliate?.login || "",
          l.click?.device || l.device || "",
          l.click?.source || "",
          l.click?.sub1 || "",
          l.click?.sub2 || "",
          l.click?.clickId || l.clickId || "",
          l.partnerStatus || "",
          l.externalId || "",
        ];
      }
      cursor = batch[batch.length - 1]?.id;
      if (!cursor) break;
    }
  }

  return csvResponse("leads.csv", [
    "createdAt",
    "status",
    "firstName",
    "lastName",
    "email",
    "phone",
    "country",
    "lander",
    "affiliate",
    "device",
    "source",
    "sub1",
    "sub2",
    "clickId",
    "partnerStatus",
    "externalId",
  ], rows());
}
