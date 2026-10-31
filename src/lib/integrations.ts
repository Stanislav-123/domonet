import { prisma } from "./db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";

const PHP_DIR = process.env.PHP_INTEGRATION_DIR || "/var/www/integrations";
const PHP_BASE_URL = process.env.PHP_INTEGRATION_URL || "http://localhost/integrations";

export async function saveIntegrationFile(id: string, code: string) {
  await mkdir(PHP_DIR, { recursive: true });
  await writeFile(join(PHP_DIR, `${id}.php`), code, "utf-8");
}

export async function deleteIntegrationFile(id: string) {
  try {
    await unlink(join(PHP_DIR, `${id}.php`));
  } catch { /* file may not exist */ }
}

function getIntegrationUrl(id: string) {
  return `${PHP_BASE_URL}/${id}.php`;
}

type LeadData = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  clickId?: string | null;
  ip?: string | null;
  country?: string | null;
  device?: string | null;
  campaignId?: string | null;
};

type ClickData = {
  userAgent?: string | null;
  sub1?: string | null;
  sub2?: string | null;
  sub3?: string | null;
  sub4?: string | null;
  sub5?: string | null;
} | null;

export async function sendLeadToIntegration(lead: LeadData, click: ClickData) {
  if (!lead.campaignId) return;

  const campaignIntegrations = await prisma.campaignIntegration.findMany({
    where: { campaignId: lead.campaignId },
    include: { integration: true },
  });

  const active = campaignIntegrations.filter((ci) => ci.integration.active);
  if (active.length === 0) return;

  const chosen = weightedRandom(active);
  if (!chosen) return;

  const integration = chosen.integration;
  const url = getIntegrationUrl(integration.id);

  const payload = {
    firstName: lead.name,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    clickId: lead.clickId || "",
    ip: lead.ip || "",
    userAgent: click?.userAgent || "",
    country: lead.country || "",
    sub1: click?.sub1 || "",
    sub2: click?.sub2 || "",
    sub3: click?.sub3 || "",
    sub4: click?.sub4 || "",
    sub5: click?.sub5 || "",
  };

  let responseText = "";
  let ok = false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    responseText = await res.text().catch(() => "");
    ok = res.ok;
  } catch (e) {
    responseText = e instanceof Error ? e.message : "Network error";
  }

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      integrationId: integration.id,
      partnerSentAt: new Date(),
      partnerResponse: responseText.slice(0, 10000),
      status: ok ? "lead" : "new",
      partnerStatus: ok ? "sent" : "error",
    },
  });
}

function weightedRandom<T extends { weight: number }>(items: T[]): T | null {
  const total = items.reduce((s, i) => s + i.weight, 0);
  if (total === 0) return items[0] || null;
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1] || null;
}
