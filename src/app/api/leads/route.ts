import { NextRequest, NextResponse } from "next/server";
import { createLead, leadSchema } from "@/lib/leads";
import { clientIp, jsonError } from "@/lib/http";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Проверьте поля формы");
  }
  try {
    const lead = await createLead(parsed.data, clientIp(req));
    return NextResponse.json({ ok: true, id: lead.id, status: lead.status });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Ошибка записи лида", 400);
  }
}
