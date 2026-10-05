import { UAParser } from "ua-parser-js";

export function parseUa(userAgent: string | null) {
  const parser = new UAParser(userAgent || "");
  const result = parser.getResult();
  const deviceType = result.device.type || "desktop";
  return {
    device: deviceType,
    os: [result.os.name, result.os.version].filter(Boolean).join(" ") || null,
    browser:
      [result.browser.name, result.browser.version].filter(Boolean).join(" ") ||
      null,
  };
}

export function detectBot(userAgent: string | null) {
  if (!userAgent || userAgent.length < 12) return true;
  return /bot|crawler|spider|crawling|headless|phantom|puppeteer|playwright|curl|wget|python-requests|httpclient|axios|go-http|scrapy|facebookexternalhit|preview/i.test(
    userAgent,
  );
}
