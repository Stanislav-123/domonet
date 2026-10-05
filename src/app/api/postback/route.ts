import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}

async function handlePostback(req: NextRequest) {
  const url = new URL(req.url);
  const clickId = url.searchParams.get("click_id") || url.searchParams.get("clickid");
  const externalId = url.searchParams.get("external_id") || url.searchParams.get("externalid");
  const status = url.searchParams.get("status");
  const payoutStr = url.searchParams.get("payout");

  if (!clickId && !externalId) {
    return NextResponse.json({ error: "click_id or external_id required" }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: clickId ? { clickId } : { externalId: externalId! },
    orderBy: { createdAt: "desc" },
  });

  if (!lead) {
    return NextResponse.json({ error: "lead not found" }, { status: 404 });
  }

  const data: { status?: "sale" | "lead" | "rejected"; payout?: number } = {};

  if (status === "sale" || status === "approve" || status === "approved") {
    data.status = "sale";
  } else if (status === "lead" || status === "hold") {
    data.status = "lead";
  } else if (status === "reject" || status === "rejected" || status === "trash") {
    data.status = "rejected";
  }

  if (payoutStr) {
    const payout = parseFloat(payoutStr);
    if (isFinite(payout) && payout >= 0) {
      data.payout = payout;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  await prisma.lead.update({ where: { id: lead.id }, data });

  return NextResponse.json({ ok: true, leadId: lead.id });
}
