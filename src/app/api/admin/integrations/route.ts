import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/api";
import { jsonError } from "@/lib/http";
import { saveIntegrationFile } from "@/lib/integrations";
import { z } from "zod";

export async function GET() {
  const { error } = await requireOwner();
  if (error) return error;
  const integrations = await prisma.integration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { userId: true } },
    },
  });
  return NextResponse.json({
    integrations: integrations.map((i) => ({
      ...i,
      userIds: i.users.map((u) => u.userId),
      users: undefined,
    })),
  });
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1),
  userIds: z.array(z.string().min(1)).optional().default([]),
});

export async function POST(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Некорректные данные");

  const userIds = [...new Set(parsed.data.userIds)];
  if (userIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, role: "user" },
      select: { id: true },
    });
    if (users.length !== userIds.length) return jsonError("Некорректные пользователи");
  }

  const integration = await prisma.integration.create({
    data: {
      name: parsed.data.name,
      code: parsed.data.code,
      users: userIds.length
        ? { create: userIds.map((userId) => ({ userId })) }
        : undefined,
    },
    include: { users: { select: { userId: true } } },
  });
  await saveIntegrationFile(integration.id, integration.code);
  return NextResponse.json({
    integration: {
      ...integration,
      userIds: integration.users.map((u) => u.userId),
      users: undefined,
    },
  });
}
