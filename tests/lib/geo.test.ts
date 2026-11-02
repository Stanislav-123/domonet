import { describe, it, expect, beforeEach, vi } from 'vitest';
import { normalizeIp, isPrivateIp, countryFromHeaders, requestIp } from '../../src/lib/geo';

describe('geo.ts', () => {
  describe('normalizeIp', () => {
    it('should normalize IPv4', () => {
      expect(normalizeIp('192.168.1.1')).toBe('192.168.1.1');
      expect(normalizeIp('  192.168.1.1  ')).toBe('192.168.1.1');
    });

    it('should handle IPv6', () => {
      expect(normalizeIp('[2001:db8::1]')).toBe('2001:db8::1');
      expect(normalizeIp('::1')).toBe('::1');
    });

    it('should strip IPv4-mapped IPv6 prefix', () => {
      expect(normalizeIp('::ffff:192.168.1.1')).toBe('192.168.1.1');
    });

    it('should handle zone ID in IPv6', () => {
      expect(normalizeIp('fe80::1%eth0')).toBe('fe80::1');
    });

    it('should handle null or empty', () => {
      expect(normalizeIp(null)).toBe('');
      expect(normalizeIp('')).toBe('');
      expect(normalizeIp(undefined)).toBe('');
    });
  });

  describe('isPrivateIp', () => {
    it('should detect localhost', () => {
      expect(isPrivateIp('127.0.0.1')).toBe(true);
      expect(isPrivateIp('127.0.0.5')).toBe(true);
      expect(isPrivateIp('::1')).toBe(true);
      expect(isPrivateIp('localhost')).toBe(true);
      expect(isPrivateIp('0.0.0.0')).toBe(true);
    });

    it('should detect private IPv4 ranges', () => {
      expect(isPrivateIp('10.0.0.1')).toBe(true);
      expect(isPrivateIp('10.255.255.255')).toBe(true);
      expect(isPrivateIp('192.168.0.1')).toBe(true);
      expect(isPrivateIp('192.168.255.255')).toBe(true);
      expect(isPrivateIp('172.16.0.1')).toBe(true);
      expect(isPrivateIp('172.31.255.255')).toBe(true);
      expect(isPrivateIp('169.254.0.1')).toBe(true);
    });

    it('should not flag 172.15 or 172.32 as private', () => {
      expect(isPrivateIp('172.15.0.1')).toBe(false);
      expect(isPrivateIp('172.32.0.1')).toBe(false);
    });

    it('should detect private IPv6 ranges', () => {
      expect(isPrivateIp('fc00::1')).toBe(true);
      expect(isPrivateIp('fd00::1')).toBe(true);
      expect(isPrivateIp('fe80::1')).toBe(true);
    });

    it('should not flag public IPs', () => {
      expect(isPrivateIp('8.8.8.8')).toBe(false);
      expect(isPrivateIp('1.1.1.1')).toBe(false);
      expect(isPrivateIp('93.184.216.34')).toBe(false);
      expect(isPrivateIp('2001:4860:4860::8888')).toBe(false);
    });
  });

  describe('countryFromHeaders', () => {
    it('should extract country from Cloudflare header', () => {
      const headers = new Headers({ 'cf-ipcountry': 'US' });
      expect(countryFromHeaders(headers)).toBe('US');
    });

    it('should extract country from Vercel header', () => {
      const headers = new Headers({ 'x-vercel-ip-country': 'GB' });
      expect(countryFromHeaders(headers)).toBe('GB');
    });

    it('should prioritize cf-ipcountry', () => {
      const headers = new Headers({
        'cf-ipcountry': 'US',
        'x-vercel-ip-country': 'GB',
      });
      expect(countryFromHeaders(headers)).toBe('US');
    });

    it('should ignore invalid country codes', () => {
      expect(countryFromHeaders(new Headers({ 'cf-ipcountry': 'XX' }))).toBeNull();
      expect(countryFromHeaders(new Headers({ 'cf-ipcountry': 'T1' }))).toBeNull();
      expect(countryFromHeaders(new Headers({ 'cf-ipcountry': 'ZZ' }))).toBeNull();
    });

    it('should return null if no header found', () => {
      expect(countryFromHeaders(new Headers())).toBeNull();
    });
  });

  describe('requestIp', () => {
    it('should extract IP from Cloudflare header', () => {
      const headers = new Headers({ 'cf-connecting-ip': '1.2.3.4' });
      expect(requestIp(headers)).toBe('1.2.3.4');
    });

    it('should extract IP from X-Real-IP', () => {
      const headers = new Headers({ 'x-real-ip': '5.6.7.8' });
      expect(requestIp(headers)).toBe('5.6.7.8');
    });

    it('should extract first IP from X-Forwarded-For', () => {
      const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
      expect(requestIp(headers)).toBe('1.2.3.4');
    });

    it('should prioritize cf-connecting-ip over others', () => {
      const headers = new Headers({
        'cf-connecting-ip': '1.2.3.4',
        'x-real-ip': '5.6.7.8',
        'x-forwarded-for': '9.10.11.12',
      });
      expect(requestIp(headers)).toBe('1.2.3.4');
    });

    it('should return empty string if no IP found', () => {
      expect(requestIp(new Headers())).toBe('');
    });
  });
});
