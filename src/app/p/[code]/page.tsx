import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getLanderById, getLanderBySlug, listLanders } from "@/lib/landers";
import { appUrl } from "@/lib/http";
import { PrelandView } from "@/components/tracker/PrelandView";

export default async function PrelandPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ cid?: string; land?: string }>;
}) {
  const { code } = await params;
  const { cid, land } = await searchParams;
  const link = await prisma.trackingLink.findUnique({
    where: { code },
  });
  if (!link || !link.active) notFound();

  const click = cid ? await prisma.click.findUnique({ where: { clickId: cid } }) : null;
  if (!click) notFound();

  const lander = land
    ? await getLanderBySlug(land)
    : click.landerId
      ? await getLanderById(click.landerId)
      : (await listLanders())[0] ?? null;

  if (!lander) notFound();

  return <PrelandView clickId={click.clickId} landerUrl={`${appUrl()}/l/${lander.slug}?cid=${click.clickId}`} />;
}
