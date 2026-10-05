import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Некорректные данные");

  const user = await prisma.user.findUnique({
    where: { login: parsed.data.login },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return jsonError("Неверный логин или пароль", 401);
  }

  await createSession({
    id: user.id,
    login: user.login,
    name: user.name,
    role: user.role,
  });

  const next = "/admin";
  return NextResponse.json({ ok: true, next });
}
