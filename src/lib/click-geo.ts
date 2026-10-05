import { prisma } from "./db";
import { isPrivateIp, normalizeIp } from "./geo";

export async function saveClickCountry(clickId: string, country: string, ip?: string | null) {
  const code = country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;

  const click = await prisma.click.findUnique({ where: { clickId } });
  if (!click) return null;

  const data: { country: string; ip?: string } = { country: code };
  const cleanIp = normalizeIp(ip);
  if (cleanIp && !isPrivateIp(cleanIp)) data.ip = cleanIp;

  const updated = await prisma.click.update({
    where: { id: click.id },
    data,
  });

  await prisma.lead.updateMany({
    where: { clickId, OR: [{ country: null }, { country: "" }] },
    data: { country: code },
  });

  return updated;
}
