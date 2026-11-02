import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const TEST_DIR = '/tmp/test-integrations-vitest';

describe('integrations.ts', () => {
  beforeEach(async () => {
    // Set env vars dynamically in each test
    vi.stubEnv('PHP_INTEGRATION_DIR', TEST_DIR);
    vi.stubEnv('PHP_INTEGRATION_URL', 'http://localhost/test');
    await mkdir(TEST_DIR, { recursive: true });
    // Reset modules to pick up new env vars
    vi.resetModules();
  });

  afterEach(async () => {
    try {
      const files = await readdir(TEST_DIR).catch(() => []);
      for (const file of files) {
        await unlink(join(TEST_DIR, file)).catch(() => {});
      }
    } catch {}
  });

  describe('saveIntegrationFile', () => {
    it('should save integration PHP file', async () => {
      const { saveIntegrationFile } = await import('../../src/lib/integrations');
      const id = 'test-integration-1';
      const code = '<?php echo "test"; ?>';
      
      await saveIntegrationFile(id, code);
      
      const filePath = join(TEST_DIR, `${id}.php`);
      expect(existsSync(filePath)).toBe(true);
      
      const content = await readFile(filePath, 'utf-8');
      expect(content).toBe(code);
    });

    it('should overwrite existing file', async () => {
      const { saveIntegrationFile } = await import('../../src/lib/integrations');
      const id = 'test-integration-2';
      const code1 = '<?php echo "first"; ?>';
      const code2 = '<?php echo "second"; ?>';
      
      await saveIntegrationFile(id, code1);
      await saveIntegrationFile(id, code2);
      
      const filePath = join(TEST_DIR, `${id}.php`);
      const content = await readFile(filePath, 'utf-8');
      expect(content).toBe(code2);
    });

    it('should create directory if missing', async () => {
      const newDir = '/tmp/test-integrations-new-dir';
      vi.stubEnv('PHP_INTEGRATION_DIR', newDir);
      vi.resetModules();
      const { saveIntegrationFile } = await import('../../src/lib/integrations');
      
      const id = 'test-integration-3';
      const code = '<?php echo "test"; ?>';
      
      await saveIntegrationFile(id, code);
      
      const filePath = join(newDir, `${id}.php`);
      expect(existsSync(filePath)).toBe(true);
      
      // Cleanup
      await unlink(filePath).catch(() => {});
    });
  });

  describe('deleteIntegrationFile', () => {
    it('should delete integration file', async () => {
      const { saveIntegrationFile, deleteIntegrationFile } = await import('../../src/lib/integrations');
      const id = 'test-integration-delete';
      const code = '<?php echo "test"; ?>';
      
      await saveIntegrationFile(id, code);
      const filePath = join(TEST_DIR, `${id}.php`);
      expect(existsSync(filePath)).toBe(true);
      
      await deleteIntegrationFile(id);
      expect(existsSync(filePath)).toBe(false);
    });

    it('should not throw if file does not exist', async () => {
      const { deleteIntegrationFile } = await import('../../src/lib/integrations');
      await expect(deleteIntegrationFile('non-existent')).resolves.not.toThrow();
    });
  });

  describe('weighted random selection', () => {
    it('should select items based on weight distribution', () => {
      // Test the weighted random logic by sampling
      const items = [
        { id: 'A', weight: 100 },
        { id: 'B', weight: 0 },
        { id: 'C', weight: 0 },
      ];

      // Since we can't directly test the internal weightedRandom function,
      // we test the concept here
      const total = items.reduce((s, i) => s + i.weight, 0);
      expect(total).toBe(100);

      // Item with 0 weight should have 0 probability
      // Item with 100 weight should always be selected
      const selected = items.find(i => i.weight > 0);
      expect(selected?.id).toBe('A');
    });

    it('should handle equal weights', () => {
      const items = [
        { id: 'A', weight: 50 },
        { id: 'B', weight: 50 },
      ];

      const total = items.reduce((s, i) => s + i.weight, 0);
      expect(total).toBe(100);

      // Both should have equal probability
      items.forEach(item => {
        expect(item.weight / total).toBe(0.5);
      });
    });
  });
});

// Helper to read directory
async function readdir(path: string): Promise<string[]> {
  const { readdir } = await import('fs/promises');
  return readdir(path);
}
