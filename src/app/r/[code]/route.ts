import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appUrl, clientIp, headerCountry } from "@/lib/http";
import { resolveTracking } from "@/lib/tracker";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const url = new URL(req.url);
  const jar = await cookies();

  try {
    const { click, lander } = await resolveTracking({
      code,
      existingClickId: jar.get("dm_cid")?.value,
      ip: clientIp(req),
      userAgent: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      headerCountry: headerCountry(req),
      source: url.searchParams.get("source") || url.searchParams.get("utm_source"),
      sub1: url.searchParams.get("sub1"),
      sub2: url.searchParams.get("sub2"),
      sub3: url.searchParams.get("sub3"),
      sub4: url.searchParams.get("sub4"),
      sub5: url.searchParams.get("sub5"),
      landerSlug: url.searchParams.get("land"),
      locale: req.headers.get("accept-language"),
    });

    jar.set("dm_cid", click.clickId, { path: "/", maxAge: 60 * 60 * 24, sameSite: "lax" });

    const dest = new URL(`${appUrl()}/p/${code}`);
    dest.searchParams.set("cid", click.clickId);
    dest.searchParams.set("land", lander.slug);
    return NextResponse.redirect(dest);
  } catch {
    return NextResponse.redirect(`${appUrl()}/`);
  }
}
