const cache = new Map<string, { country: string; at: number }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

export function normalizeIp(raw?: string | null) {
  if (!raw) return "";
  let ip = raw.trim().replace(/^\[|\]$/g, "");
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  if (ip.includes("%")) ip = ip.split("%")[0] || ip;
  return ip;
}

export function isPrivateIp(ip: string) {
  const n = normalizeIp(ip);
  if (!n || n === "0.0.0.0" || n === "::1" || n === "localhost") return true;
  if (n.startsWith("127.") || n.startsWith("10.") || n.startsWith("192.168.") || n.startsWith("169.254.")) {
    return true;
  }
  if (n.startsWith("172.")) {
    const second = Number(n.split(".")[1]);
    return second >= 16 && second <= 31;
  }
  if (n.startsWith("fc") || n.startsWith("fd") || n.startsWith("fe80")) return true;
  return false;
}

export function countryFromHeaders(headers: Headers) {
  const raw =
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-country-code") ||
    headers.get("cloudfront-viewer-country") ||
    headers.get("x-appengine-country") ||
    null;
  if (!raw || raw === "XX" || raw === "T1" || raw === "ZZ") return null;
  return raw.toUpperCase();
}

export function requestIp(headers: Headers) {
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("true-client-ip"),
    headers.get("x-real-ip"),
    headers.get("x-client-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
    headers.get("fly-client-ip"),
  ];
  for (const raw of candidates) {
    const ip = normalizeIp(raw);
    if (ip) return ip;
  }
  return "";
}

async function fetchJson(url: string, ms = 3500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { Accept: "application/json", "User-Agent": "domonet-geo/1.0" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function cacheGet(ip: string) {
  const hit = cache.get(ip);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_MS) {
    cache.delete(ip);
    return null;
  }
  return hit.country;
}

function cacheSet(ip: string, country: string) {
  if (cache.size > 4000) cache.clear();
  cache.set(ip, { country, at: Date.now() });
}

async function lookupProviders(ip: string) {
  const who = (await fetchJson(`https://ipwho.is/${encodeURIComponent(ip)}`)) as {
    success?: boolean;
    country_code?: string;
  } | null;
  if (who?.success && who.country_code) return who.country_code.toUpperCase();

  const api = (await fetchJson(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
  )) as { status?: string; countryCode?: string } | null;
  if (api?.status === "success" && api.countryCode) return api.countryCode.toUpperCase();

  const co = (await fetchJson(`https://ipapi.co/${encodeURIComponent(ip)}/json/`)) as {
    country_code?: string;
    error?: boolean;
  } | null;
  if (!co?.error && co?.country_code) return co.country_code.toUpperCase();

  return null;
}

export async function lookupCountry(ip: string, headerCountry?: string | null) {
  if (headerCountry && headerCountry !== "XX" && headerCountry !== "T1" && headerCountry !== "ZZ") {
    return headerCountry.toUpperCase();
  }

  const clean = normalizeIp(ip);
  if (clean && !isPrivateIp(clean)) {
    const cached = cacheGet(clean);
    if (cached) return cached;
    const found = await lookupProviders(clean);
    if (found) {
      cacheSet(clean, found);
      return found;
    }
  }

  if (isPrivateIp(clean) && process.env.NODE_ENV !== "production") {
    const self = (await fetchJson("https://ipwho.is/")) as {
      success?: boolean;
      country_code?: string;
    } | null;
    if (self?.success && self.country_code) return self.country_code.toUpperCase();
  }

  return null;
}
