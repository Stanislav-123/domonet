import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure mocks are available before module imports
const { mockPrisma, mockGetLanderById, mockGetLanderBySlug, mockListLanders, mockGetCampaignLanderIds, mockLookupCountry, mockParseUa, mockDetectBot } = vi.hoisted(() => {
  return {
    mockPrisma: {
      lead: {
        count: vi.fn(),
      },
    },
    mockGetLanderById: vi.fn(),
    mockGetLanderBySlug: vi.fn(),
    mockListLanders: vi.fn(),
    mockGetCampaignLanderIds: vi.fn(),
    mockLookupCountry: vi.fn(),
    mockParseUa: vi.fn(),
    mockDetectBot: vi.fn(),
  };
});

vi.mock('../../src/lib/db', () => ({
  prisma: mockPrisma,
}));

vi.mock('../../src/lib/landers', () => ({
  getLanderById: mockGetLanderById,
  getLanderBySlug: mockGetLanderBySlug,
  listLanders: mockListLanders,
}));

vi.mock('../../src/lib/campaigns', () => ({
  getCampaignLanderIds: mockGetCampaignLanderIds,
}));

vi.mock('../../src/lib/geo', () => ({
  lookupCountry: mockLookupCountry,
}));

vi.mock('../../src/lib/ua', () => ({
  parseUa: mockParseUa,
  detectBot: mockDetectBot,
}));

// Now import the module under test
import { isOverDailyCap, pickLander } from '../../src/lib/tracker';

describe('tracker.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isOverDailyCap', () => {
    it('should return false when no daily cap is set', async () => {
      const lander = { id: 'lander1', dailyCap: null };
      const result = await isOverDailyCap(lander);
      expect(result).toBe(false);
    });

    it('should return false when daily cap is 0', async () => {
      const lander = { id: 'lander1', dailyCap: 0 };
      const result = await isOverDailyCap(lander);
      expect(result).toBe(false);
    });

    it('should return false when count is below cap', async () => {
      const lander = { id: 'lander1', dailyCap: 100 };
      mockPrisma.lead.count.mockResolvedValue(50);

      const result = await isOverDailyCap(lander);
      expect(result).toBe(false);
      expect(mockPrisma.lead.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            landerId: 'lander1',
            status: { not: 'duplicate' },
          }),
        })
      );
    });

    it('should return true when count equals cap', async () => {
      const lander = { id: 'lander1', dailyCap: 100 };
      mockPrisma.lead.count.mockResolvedValue(100);

      const result = await isOverDailyCap(lander);
      expect(result).toBe(true);
    });

    it('should return true when count exceeds cap', async () => {
      const lander = { id: 'lander1', dailyCap: 100 };
      mockPrisma.lead.count.mockResolvedValue(150);

      const result = await isOverDailyCap(lander);
      expect(result).toBe(true);
    });
  });

  describe('pickLander', () => {
    beforeEach(() => {
      mockListLanders.mockResolvedValue([
        { id: 'l1', slug: 'lander1', active: true, weight: 100 },
        { id: 'l2', slug: 'lander2', active: true, weight: 100 },
        { id: 'l3', slug: 'lander3', active: true, weight: 100 },
      ]);
      mockGetLanderById.mockImplementation(async (id: string) => {
        const landers = await mockListLanders();
        return landers.find((l: any) => l.id === id) || null;
      });
    });

    it('should return forced lander when specified', async () => {
      const forcedLander = { id: 'l1', slug: 'lander1', active: true };
      mockGetLanderById.mockResolvedValue(forcedLander);

      const result = await pickLander({ forcedLanderId: 'l1' });
      expect(result).toEqual(forcedLander);
    });

    it('should ignore forced lander if allowed landers are specified', async () => {
      const result = await pickLander({
        forcedLanderId: 'l1',
        allowedLanderIds: ['l2', 'l3'],
      });

      expect(result).toBeTruthy();
      expect(['l2', 'l3']).toContain(result?.id);
      expect(result?.id).not.toBe('l1');
    });

    it('should pick from allowed landers when specified', async () => {
      const result = await pickLander({
        allowedLanderIds: ['l2'],
      });

      expect(result?.id).toBe('l2');
    });

    it('should return null when no landers available', async () => {
      mockListLanders.mockResolvedValue([]);

      const result = await pickLander();
      expect(result).toBeNull();
    });

    it('should return null when allowed landers list is empty after filtering', async () => {
      const result = await pickLander({
        allowedLanderIds: ['non-existent'],
      });

      expect(result).toBeNull();
    });

    it('should randomly pick from all landers when no constraints', async () => {
      const result = await pickLander();

      expect(result).toBeTruthy();
      expect(['l1', 'l2', 'l3']).toContain(result?.id);
    });
  });
});
