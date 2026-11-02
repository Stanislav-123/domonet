import { describe, it, expect, vi, beforeEach } from 'vitest';
import { leadSchema } from '../../src/lib/leads';
import { z } from 'zod';

describe('leads.ts', () => {
  describe('leadSchema validation', () => {
    it('should accept valid lead data', () => {
      const validLead = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@example.com',
        phone: '+79991234567',
        clickId: 'click123',
        landerId: 'lander1',
      };

      const result = leadSchema.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it('should reject firstName that is too short', () => {
      const invalidLead = {
        firstName: 'I',
        lastName: 'Петров',
        email: 'ivan@example.com',
        phone: '+79991234567',
        landerId: 'lander1',
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should reject firstName with numbers', () => {
      const invalidLead = {
        firstName: 'Ivan123',
        lastName: 'Петров',
        email: 'ivan@example.com',
        phone: '+79991234567',
        landerId: 'lander1',
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidLead = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'not-an-email',
        phone: '+79991234567',
        landerId: 'lander1',
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should reject phone with too few digits', () => {
      const invalidLead = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@example.com',
        phone: '123',
        landerId: 'lander1',
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should accept phone with 10-15 digits', () => {
      const validNumbers = [
        '+1234567890', // 10 digits
        '+123456789012345', // 15 digits
        '12345678901', // 11 digits
      ];

      validNumbers.forEach(phone => {
        const lead = {
          firstName: 'Иван',
          lastName: 'Петров',
          email: 'ivan@example.com',
          phone,
          landerId: 'lander1',
        };

        const result = leadSchema.safeParse(lead);
        expect(result.success).toBe(true);
      });
    });

    it('should reject phone with more than 15 digits', () => {
      const invalidLead = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@example.com',
        phone: '+1234567890123456', // 16 digits
        landerId: 'lander1',
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should accept clickId as optional', () => {
      const leadWithoutClick = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@example.com',
        phone: '+79991234567',
        landerId: 'lander1',
      };

      const result = leadSchema.safeParse(leadWithoutClick);
      expect(result.success).toBe(true);
    });

    it('should accept null clickId', () => {
      const leadWithNullClick = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@example.com',
        phone: '+79991234567',
        clickId: null,
        landerId: 'lander1',
      };

      const result = leadSchema.safeParse(leadWithNullClick);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from strings', () => {
      const leadWithSpaces = {
        firstName: '  Иван  ',
        lastName: '  Петров  ',
        email: '  ivan@example.com  ',
        phone: '  +79991234567  ',
        landerId: 'lander1',
      };

      const result = leadSchema.parse(leadWithSpaces);
      expect(result.firstName).toBe('Иван');
      expect(result.lastName).toBe('Петров');
      expect(result.email).toBe('ivan@example.com');
      expect(result.phone).toBe('+79991234567');
    });

    it('should reject empty landerId', () => {
      const invalidLead = {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@example.com',
        phone: '+79991234567',
        landerId: '',
      };

      const result = leadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it('should accept various valid Unicode names', () => {
      const names = [
        { firstName: 'José', lastName: 'García' },
        { firstName: 'François', lastName: 'Müller' },
        { firstName: 'Владимир', lastName: 'Иванов' },
        { firstName: 'Мария', lastName: 'Петрова' },
      ];

      names.forEach(({ firstName, lastName }) => {
        const lead = {
          firstName,
          lastName,
          email: 'test@example.com',
          phone: '+79991234567',
          landerId: 'lander1',
        };

        const result = leadSchema.safeParse(lead);
        expect(result.success).toBe(true);
      });
    });

    it('should reject names with special characters', () => {
      const invalidNames = [
        { firstName: 'John@Doe', lastName: 'Smith' },
        { firstName: 'John', lastName: 'Smith-Jones' },
        { firstName: 'John123', lastName: 'Smith' },
      ];

      invalidNames.forEach(({ firstName, lastName }) => {
        const lead = {
          firstName,
          lastName,
          email: 'test@example.com',
          phone: '+79991234567',
          landerId: 'lander1',
        };

        const result = leadSchema.safeParse(lead);
        expect(result.success).toBe(false);
      });
    });
  });
});
