import { describe, it, expect } from 'vitest';
import { parseUa, detectBot } from '../../src/lib/ua';

describe('ua.ts', () => {
  describe('parseUa', () => {
    it('should parse Chrome user agent', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUa(ua);
      
      expect(result.device).toBe('desktop');
      expect(result.os).toContain('Windows');
      expect(result.browser).toContain('Chrome');
    });

    it('should parse mobile Safari user agent', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
      const result = parseUa(ua);
      
      expect(result.device).toBe('mobile');
      expect(result.os).toContain('iOS');
      expect(result.browser).toContain('Safari');
    });

    it('should parse Android Chrome user agent', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
      const result = parseUa(ua);
      
      expect(result.device).toBe('mobile');
      expect(result.os).toContain('Android');
      expect(result.browser).toContain('Chrome');
    });

    it('should handle null user agent', () => {
      const result = parseUa(null);
      
      expect(result.device).toBe('desktop');
      expect(result.os).toBeNull();
      expect(result.browser).toBeNull();
    });

    it('should handle empty user agent', () => {
      const result = parseUa('');
      
      expect(result.device).toBe('desktop');
    });
  });

  describe('detectBot', () => {
    it('should detect known bots', () => {
      expect(detectBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
      expect(detectBot('curl/7.68.0')).toBe(true);
      expect(detectBot('python-requests/2.28.0')).toBe(true);
      expect(detectBot('axios/1.4.0')).toBe(true);
      expect(detectBot('HeadlessChrome/120.0.0.0')).toBe(true);
      expect(detectBot('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe(true);
    });

    it('should detect Puppeteer/Playwright', () => {
      expect(detectBot('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/90.0.4430.93 Safari/537.36 Puppeteer')).toBe(true);
      expect(detectBot('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/90.0.4430.93 Safari/537.36 Playwright')).toBe(true);
    });

    it('should not flag legitimate browsers', () => {
      expect(detectBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')).toBe(false);
      expect(detectBot('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1')).toBe(false);
      expect(detectBot('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')).toBe(false);
    });

    it('should flag null or short user agents', () => {
      expect(detectBot(null)).toBe(true);
      expect(detectBot('')).toBe(true);
      expect(detectBot('short')).toBe(true);
    });
  });
});
