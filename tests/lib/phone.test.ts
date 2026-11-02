import { describe, it, expect } from 'vitest';
import {
  phoneRule,
  formatPhoneInput,
  phoneDigits,
  isPhoneComplete,
  sanitizeName,
  isValidName,
  isValidEmail,
  NAME_RE,
} from '../../src/lib/phone';

describe('phone.ts', () => {
  describe('phoneRule', () => {
    it('should return correct rule for country code', () => {
      const rule = phoneRule('RU', null);
      expect(rule.iso).toBe('RU');
      expect(rule.dial).toBe('7');
      expect(rule.groups).toEqual([3, 3, 2, 2]);
    });

    it('should fallback to locale if country is missing', () => {
      const rule = phoneRule(null, 'ru');
      expect(rule.iso).toBe('RU');
    });

    it('should default to US for unknown locale', () => {
      const rule = phoneRule(null, 'xx');
      expect(rule.iso).toBe('US');
    });

    it('should handle various country codes', () => {
      expect(phoneRule('US', null).dial).toBe('1');
      expect(phoneRule('GB', null).dial).toBe('44');
      expect(phoneRule('DE', null).dial).toBe('49');
      expect(phoneRule('UA', null).dial).toBe('380');
    });
  });

  describe('formatPhoneInput', () => {
    it('should format Russian phone number', () => {
      const rule = phoneRule('RU', null);
      expect(formatPhoneInput('9991234567', rule)).toBe('+7 999 123 45 67');
    });

    it('should replace 8 prefix with 7 for RU/KZ', () => {
      const rule = phoneRule('RU', null);
      expect(formatPhoneInput('89991234567', rule)).toBe('+7 999 123 45 67');
    });

    it('should format US phone number', () => {
      const rule = phoneRule('US', null);
      expect(formatPhoneInput('2025550123', rule)).toBe('+1 202 555 0123');
    });

    it('should handle partial input', () => {
      const rule = phoneRule('US', null);
      expect(formatPhoneInput('202', rule)).toBe('+1 202');
    });

    it('should strip non-digit characters', () => {
      const rule = phoneRule('RU', null);
      expect(formatPhoneInput('+7 (999) 123-45-67', rule)).toBe('+7 999 123 45 67');
    });
  });

  describe('phoneDigits', () => {
    it('should extract only digits', () => {
      expect(phoneDigits('+7 (999) 123-45-67')).toBe('79991234567');
      expect(phoneDigits('abc123def456')).toBe('123456');
      expect(phoneDigits('no-digits')).toBe('');
    });
  });

  describe('isPhoneComplete', () => {
    it('should return true for complete phone number', () => {
      const rule = phoneRule('RU', null);
      expect(isPhoneComplete('+7 999 123 45 67', rule)).toBe(true);
      expect(isPhoneComplete('79991234567', rule)).toBe(true);
    });

    it('should return false for incomplete phone number', () => {
      const rule = phoneRule('RU', null);
      expect(isPhoneComplete('+7 999 123', rule)).toBe(false);
    });
  });

  describe('NAME_RE and name validation', () => {
    it('should accept valid names', () => {
      expect(NAME_RE.test('John')).toBe(true);
      expect(NAME_RE.test('Мария')).toBe(true);
      expect(NAME_RE.test('José')).toBe(true);
      expect(NAME_RE.test('François')).toBe(true);
    });

    it('should reject names with numbers', () => {
      expect(NAME_RE.test('John123')).toBe(false);
    });

    it('should reject names with special characters', () => {
      expect(NAME_RE.test('John@Doe')).toBe(false);
      expect(NAME_RE.test('John-Doe')).toBe(false);
    });

    it('should reject too short names', () => {
      expect(NAME_RE.test('J')).toBe(false);
    });
  });

  describe('sanitizeName', () => {
    it('should remove non-letter characters', () => {
      expect(sanitizeName('John123')).toBe('John');
      expect(sanitizeName('Mary-Jane')).toBe('MaryJane');
      expect(sanitizeName('Иван@Петров')).toBe('ИванПетров');
    });

    it('should truncate to 80 characters', () => {
      const longName = 'a'.repeat(100);
      expect(sanitizeName(longName)).toHaveLength(80);
    });
  });

  describe('isValidName', () => {
    it('should validate correct names', () => {
      expect(isValidName('John')).toBe(true);
      expect(isValidName('  Maria  ')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidName('J')).toBe(false);
      expect(isValidName('John123')).toBe(false);
      expect(isValidName('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('first.last@sub.domain.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user..name@example.com')).toBe(false);
      expect(isValidEmail('.user@example.com')).toBe(false);
      expect(isValidEmail('user.@example.com')).toBe(false);
    });

    it('should reject too short or too long emails', () => {
      expect(isValidEmail('a@b.c')).toBe(false); // too short
      expect(isValidEmail('a'.repeat(120) + '@example.com')).toBe(false); // too long
    });

    it('should handle whitespace', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
    });
  });
});
