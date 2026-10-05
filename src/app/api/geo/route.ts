import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { corsHeaders, jsonError } from "@/lib/http";
import { saveClickCountry } from "@/lib/click-geo";

const schema = z.object({
  clickId: z.string().min(4),
  country: z.string().trim().length(2),
  ip: z.string().optional().nullable(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad geo" }, { status: 400, headers: corsHeaders() });
  }
  const click = await saveClickCountry(
    parsed.data.clickId,
    parsed.data.country,
    parsed.data.ip,
  );
  if (!click) return jsonError("click not found", 404);
  return NextResponse.json({ ok: true, country: click.country }, { headers: corsHeaders() });
}
