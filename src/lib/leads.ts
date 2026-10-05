import { z } from "zod";
import { prisma } from "./db";
import { lookupCountry } from "./geo";
import { isOverDailyCap } from "./tracker";
import { getLanderById } from "./landers";
import { isValidEmail, NAME_RE, phoneDigits } from "./phone";
import { sendLeadToIntegration } from "./integrations";

export const leadSchema = z.object({
  firstName: z.string().trim().min(2).max(80).regex(NAME_RE),
  lastName: z.string().trim().min(2).max(80).regex(NAME_RE),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => isValidEmail(v)),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      const d = phoneDigits(v);
      return d.length >= 10 && d.length <= 15;
    }),
  clickId: z.string().optional().nullable(),
  landerId: z.string().min(1),
});

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export async function createLead(input: z.infer<typeof leadSchema>, ip?: string) {
  const lander = await getLanderById(input.landerId);
  if (!lander || !lander.active) {
    throw new Error("Ленд недоступен");
  }
  if (await isOverDailyCap(lander)) {
    throw new Error("Лимит заявок на сегодня исчерпан");
  }

  const click = input.clickId
    ? await prisma.click.findUnique({ where: { clickId: input.clickId } })
    : null;

  const phone = normalizePhone(input.phone);
  const country =
    click?.country || (await lookupCountry(ip || click?.ip || "", null));
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dup = await prisma.lead.findFirst({
    where: {
      createdAt: { gte: since },
      OR: [
        { email: input.email.toLowerCase() },
        { phone },
      ],
    },
  });

  const lead = await prisma.lead.create({
    data: {
      name: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      phone,
      country: country || null,
      status: dup ? "duplicate" : "new",
      clickId: click?.clickId,
      landerId: lander.id,
      campaignId: click?.campaignId,
      affiliateId: click?.affiliateId,
      ip: ip || click?.ip,
      device: click?.device,
    },
  });

  if (click) {
    await prisma.event.create({
      data: {
        type: "form_submit",
        clickId: click.clickId,
        landerId: lander.id,
        campaignId: click.campaignId,
        affiliateId: click.affiliateId,
        isBot: click.isBot,
      },
    });
  }

  if (lead.status !== "duplicate") {
    sendLeadToIntegration(lead, click).catch(() => {});
  }

  return lead;
}
