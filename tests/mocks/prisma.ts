import { vi } from 'vitest';

export const createMockPrisma = () => ({
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  campaign: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  trackingLink: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  click: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  lead: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  lander: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  event: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  integration: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  campaignIntegration: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  campaignLander: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
});

export type MockPrisma = ReturnType<typeof createMockPrisma>;
