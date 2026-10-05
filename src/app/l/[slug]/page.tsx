import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getLanderBySlug } from "@/lib/landers";
import { LanderSwitch } from "@/components/lands/LanderSwitch";
import { recordEvent, resolveTracking } from "@/lib/tracker";
import { countryFromHeaders, lookupCountry, requestIp } from "@/lib/geo";

export default async function LanderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cid?: string }>;
}) {
  const { slug } = await params;
  const { cid } = await searchParams;
  const lander = await getLanderBySlug(slug);
  if (!lander || !lander.active) notFound();

  const jar = await cookies();
  const h = await headers();
  const ip = requestIp(h) || "0.0.0.0";
  const headerCountry = countryFromHeaders(h);
  let clickId = cid || jar.get("dm_cid")?.value || null;

  if (!clickId) {
    const tracked = await resolveTracking({
      landerSlug: slug,
      ip,
      userAgent: h.get("user-agent"),
      referer: h.get("referer"),
      headerCountry,
    });
    clickId = tracked.click.clickId;
  }

  let click = clickId ? await prisma.click.findUnique({ where: { clickId } }) : null;
  if (click && !click.country) {
    const country = await lookupCountry(ip, headerCountry);
    if (country) {
      click = await prisma.click.update({ where: { id: click.id }, data: { country } });
    }
  }

  if (clickId) {
    await recordEvent({ type: "land_view", clickId, landerId: lander.id });
  }

  return (
    <main className="min-h-screen">
      <LanderSwitch type={lander.type} landerId={lander.id} clickId={clickId} country={click?.country} />
    </main>
  );
}
