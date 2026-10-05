import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser, requireOwner } from "@/lib/api";
import { jsonError } from "@/lib/http";
import { listLanders } from "@/lib/landers";
import { z } from "zod";
import { LANDER_TYPE_VALUES } from "@/lib/lander-types";

export async function GET() {
  const { error } = await requireApiUser();
  if (error) return error;
  try {
    const landers = await listLanders();
    return NextResponse.json({ landers });
  } catch (e) {
    console.error(e);
    return jsonError(e instanceof Error ? e.message : "Не удалось загрузить ленды", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;
  const parsed = z
    .object({
      name: z.string().min(2),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
      type: z.enum(LANDER_TYPE_VALUES),
    })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Проверьте поля ленда");
  const lander = await prisma.lander.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      type: parsed.data.type as never,
    },
  });
  return NextResponse.json({ lander });
}
