import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, jsonError } from "@/lib/http";
import { recordEvent } from "@/lib/tracker";
import { z } from "zod";

const schema = z.object({
  type: z.enum([
    "back_button",
    "exit_shown",
    "exit_closed",
    "exit_clicked",
    "land_view",
    "form_start",
    "form_submit",
  ]),
  clickId: z.string().min(4),
  landerId: z.string().optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad event" }, { status: 400, headers: corsHeaders() });
  }
  const event = await recordEvent(parsed.data);
  if (!event) return jsonError("click not found", 404);
  return NextResponse.json({ ok: true }, { headers: corsHeaders() });
}
