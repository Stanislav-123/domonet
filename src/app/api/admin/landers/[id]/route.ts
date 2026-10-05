import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/api";
import { jsonError } from "@/lib/http";
import { z } from "zod";
import { LANDER_TYPE_VALUES } from "@/lib/lander-types";
import { LanderType } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error } = await requireOwner();
  if (error) return error;
  const { id } = await ctx.params;
  const parsed = z
    .object({
      name: z.string().min(2).optional(),
      type: z.enum(LANDER_TYPE_VALUES).optional(),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Некорректные данные");
  const lander = await prisma.lander.update({
    where: { id },
    data: {
      ...parsed.data,
      type: parsed.data.type as LanderType | undefined,
    },
  });
  return NextResponse.json({ lander });
}
