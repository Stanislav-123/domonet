import { prisma } from "./db";

export type LanderRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  weight: number;
  active: boolean;
  dailyCap: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listLanders(): Promise<LanderRow[]> {
  return prisma.lander.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getLanderById(id: string): Promise<LanderRow | null> {
  return prisma.lander.findUnique({ where: { id } });
}

export async function getLanderBySlug(slug: string): Promise<LanderRow | null> {
  return prisma.lander.findUnique({ where: { slug } });
}
