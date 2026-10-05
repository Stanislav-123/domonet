import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { z } from "zod";

export async function GET() {
  const { error } = await requireOwner();
  if (error) return error;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      login: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { clicks: true, leads: true, trackingLinks: true } },
    },
  });
  return NextResponse.json({ users });
}

const createSchema = z.object({
  login: z.string().min(2).max(60),
  name: z.string().min(1).max(80),
  password: z.string().min(4).max(100),
  role: z.enum(["user"]).default("user"),
});

export async function POST(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Некорректные данные");

  const existing = await prisma.user.findUnique({ where: { login: parsed.data.login } });
  if (existing) return jsonError("Логин уже занят");

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      login: parsed.data.login,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role,
    },
  });
  return NextResponse.json({ user: { id: user.id, login: user.login, name: user.name, role: user.role } });
}
