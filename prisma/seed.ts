import { PrismaClient, LanderType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const makeLinkCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  8,
);

const LANDERS: {
  slug: string;
  name: string;
  type: LanderType;
}[] = [
  { slug: "price-guess", name: "Биржа: направление", type: "price_guess" },
  { slug: "price-candles", name: "Биржа: свечи", type: "price_candles" },
  { slug: "ai-agents", name: "Платформа AQ", type: "ai_agents" },
  { slug: "profit-calc", name: "Счёт потенциала", type: "profit_calc" },
  { slug: "quiz", name: "Квиз инвестора", type: "quiz" },
  { slug: "live-signals", name: "Live-сигналы", type: "live_signals" },
  { slug: "copy-desk", name: "Копирование сделок", type: "copy_desk" },
  { slug: "airdrop", name: "Аллокация NEX", type: "airdrop" },
  { slug: "vault", name: "Волт доходности", type: "vault" },
  { slug: "briefing", name: "Утренний брифинг", type: "briefing" },
];

async function main() {
  const login = "stasAdm";
  const password = "26072001";
  const name = "Администратор";

  const passwordHash = await bcrypt.hash(password, 12);
  const owner = await prisma.user.upsert({
    where: { login },
    update: { name, role: "owner", passwordHash },
    create: { login, name, role: "owner", passwordHash },
  });

  for (const lander of LANDERS) {
    await prisma.lander.upsert({
      where: { slug: lander.slug },
      update: { name: lander.name, type: lander.type, active: true },
      create: lander,
    });
  }

  let campaign = await prisma.campaign.findFirst({
    where: { affiliateId: owner.id, name: "Crypto Domonet" },
  });
  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        name: "Crypto Domonet",
        affiliateId: owner.id,
      },
    });
  }

  const existingLink = await prisma.trackingLink.findFirst({
    where: { affiliateId: owner.id, campaignId: campaign.id },
  });
  const link =
    existingLink ||
    (await prisma.trackingLink.create({
      data: {
        code: makeLinkCode(),
        name: "Ротация всех лендов",
        campaignId: campaign.id,
        affiliateId: owner.id,
      },
    }));

  console.log(`Owner: ${login}`);
  console.log("Landers seeded:", LANDERS.length);
  console.log(`Demo funnel: /r/${link.code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
