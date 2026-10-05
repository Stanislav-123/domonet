import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/api";
import { jsonError } from "@/lib/http";
import { z } from "zod";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireOwner();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  if (id === session.id) return jsonError("Нельзя менять свою роль");
  const parsed = z
    .object({
      role: z.enum(["owner", "user"]),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Некорректная роль");
  const user = await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });
  return NextResponse.json({
    user: { id: user.id, login: user.login, name: user.name, role: user.role },
  });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireOwner();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  if (id === session.id) return jsonError("Нельзя удалить свой аккаунт");

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!existing) return jsonError("Пользователь не найден", 404);
  if (existing.role === "owner") {
    const owners = await prisma.user.count({ where: { role: "owner" } });
    if (owners <= 1) return jsonError("Нельзя удалить последнего owner");
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
