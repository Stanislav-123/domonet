import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/auth';

describe('auth.ts', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SamePassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeTruthy();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'CorrectPassword';
      const wrongPassword = 'WrongPassword';
      const hash = await hashPassword(password);
      
      const result = await verifyPassword(wrongPassword, hash);
      expect(result).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);
      
      const result = await verifyPassword('password123', hash);
      expect(result).toBe(false);
    });

    it('should handle special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);
      
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should handle Unicode characters', async () => {
      const password = 'Пароль123测试';
      const hash = await hashPassword(password);
      
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });
  });
});
