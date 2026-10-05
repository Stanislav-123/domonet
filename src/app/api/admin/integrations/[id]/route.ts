import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/api";
import { jsonError } from "@/lib/http";
import { saveIntegrationFile, deleteIntegrationFile } from "@/lib/integrations";
import { z } from "zod";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error } = await requireOwner();
  if (error) return error;
  const { id } = await ctx.params;
  const parsed = z
    .object({
      name: z.string().min(1).max(100).optional(),
      code: z.string().min(1).optional(),
      active: z.boolean().optional(),
      userIds: z.array(z.string().min(1)).optional(),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Некорректные данные");

  const existing = await prisma.integration.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return jsonError("Интеграция не найдена", 404);

  const { userIds, ...fields } = parsed.data;

  if (userIds !== undefined) {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: uniqueIds }, role: "user" },
        select: { id: true },
      });
      if (users.length !== uniqueIds.length) return jsonError("Некорректные пользователи");
    }
    await prisma.integrationUser.deleteMany({ where: { integrationId: id } });
    if (uniqueIds.length > 0) {
      await prisma.integrationUser.createMany({
        data: uniqueIds.map((userId) => ({ integrationId: id, userId })),
      });
    }
  }

  const integration = Object.keys(fields).length
    ? await prisma.integration.update({
        where: { id },
        data: fields,
        include: { users: { select: { userId: true } } },
      })
    : await prisma.integration.findUnique({
        where: { id },
        include: { users: { select: { userId: true } } },
      });

  if (!integration) return jsonError("Интеграция не найдена", 404);

  if (parsed.data.code) {
    await saveIntegrationFile(integration.id, integration.code);
  }

  return NextResponse.json({
    integration: {
      ...integration,
      userIds: integration.users.map((u) => u.userId),
      users: undefined,
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { error } = await requireOwner();
  if (error) return error;
  const { id } = await ctx.params;
  await prisma.integration.delete({ where: { id } });
  await deleteIntegrationFile(id);
  return NextResponse.json({ ok: true });
}
