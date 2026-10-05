import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appUrl, clientIp, corsHeaders, headerCountry, jsonError } from "@/lib/http";
import { detectLocaleFromHeader, popupCopy } from "@/lib/i18n";
import { resolveTracking } from "@/lib/tracker";
import { getCampaignWidget } from "@/lib/campaigns";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    code?: string;
    lander?: string;
    locale?: string;
  } | null;
  if (!body?.code) {
    return NextResponse.json({ error: "code required" }, { status: 400, headers: corsHeaders() });
  }

  const jar = await cookies();
  try {
    const { click, lander, link } = await resolveTracking({
      code: body.code,
      landerSlug: body.lander,
      existingClickId: jar.get("dm_cid")?.value,
      ip: clientIp(req),
      userAgent: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      headerCountry: headerCountry(req),
      locale: body.locale || req.headers.get("accept-language"),
    });
    jar.set("dm_cid", click.clickId, { path: "/", maxAge: 60 * 60 * 24, sameSite: "lax" });
    const landerUrl = `${appUrl()}/l/${lander.slug}?cid=${click.clickId}`;
    const locale = detectLocaleFromHeader(body.locale || req.headers.get("accept-language"));
    const widget = link?.campaignId
      ? await getCampaignWidget(link.campaignId)
      : { exitPopup: true, timedPopup: false, timedPopupSec: 15 };
    return NextResponse.json(
      {
        clickId: click.clickId,
        landerSlug: lander.slug,
        landerUrl,
        country: click.country,
        popup: popupCopy(locale),
        widget,
      },
      { headers: corsHeaders() },
    );
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "track failed", 400);
  }
}
