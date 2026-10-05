import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser, canSeeAllStats } from "@/lib/api";
import { jsonError } from "@/lib/http";
import { z } from "zod";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireApiUser();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  const parsed = z
    .object({
      status: z.enum(["new", "lead", "sale", "confirmed", "rejected", "duplicate"]).optional(),
      notes: z.string().max(500).optional(),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Некорректные данные");
  const existing = await prisma.lead.findUnique({ where: { id }, select: { affiliateId: true } });
  if (!existing) return jsonError("Лид не найден", 404);
  if (!canSeeAllStats(session.role) && existing.affiliateId !== session.id) {
    return jsonError("Нет доступа", 403);
  }
  const lead = await prisma.lead.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ lead });
}
