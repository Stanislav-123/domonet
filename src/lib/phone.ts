export type PhoneRule = {
  iso: string;
  dial: string;
  groups: number[];
  placeholder: string;
};

const RULES: Record<string, PhoneRule> = {
  RU: { iso: "RU", dial: "7", groups: [3, 3, 2, 2], placeholder: "+7 999 123-45-67" },
  KZ: { iso: "KZ", dial: "7", groups: [3, 3, 2, 2], placeholder: "+7 701 123-45-67" },
  UA: { iso: "UA", dial: "380", groups: [2, 3, 2, 2], placeholder: "+380 67 123 45 67" },
  BY: { iso: "BY", dial: "375", groups: [2, 3, 2, 2], placeholder: "+375 29 123 45 67" },
  UZ: { iso: "UZ", dial: "998", groups: [2, 3, 2, 2], placeholder: "+998 90 123 45 67" },
  AZ: { iso: "AZ", dial: "994", groups: [2, 3, 2, 2], placeholder: "+994 50 123 45 67" },
  AM: { iso: "AM", dial: "374", groups: [2, 6], placeholder: "+374 91 123456" },
  GE: { iso: "GE", dial: "995", groups: [3, 2, 2, 2], placeholder: "+995 555 12 34 56" },
  MD: { iso: "MD", dial: "373", groups: [2, 3, 3], placeholder: "+373 69 123 456" },
  US: { iso: "US", dial: "1", groups: [3, 3, 4], placeholder: "+1 202 555 0123" },
  CA: { iso: "CA", dial: "1", groups: [3, 3, 4], placeholder: "+1 416 555 0123" },
  GB: { iso: "GB", dial: "44", groups: [4, 6], placeholder: "+44 7400 123456" },
  DE: { iso: "DE", dial: "49", groups: [3, 4, 4], placeholder: "+49 151 1234 5678" },
  AT: { iso: "AT", dial: "43", groups: [3, 3, 4], placeholder: "+43 664 123 4567" },
  CH: { iso: "CH", dial: "41", groups: [2, 3, 2, 2], placeholder: "+41 79 123 45 67" },
  FR: { iso: "FR", dial: "33", groups: [1, 2, 2, 2, 2], placeholder: "+33 6 12 34 56 78" },
  ES: { iso: "ES", dial: "34", groups: [3, 3, 3], placeholder: "+34 612 345 678" },
  PT: { iso: "PT", dial: "351", groups: [3, 3, 3], placeholder: "+351 912 345 678" },
  IT: { iso: "IT", dial: "39", groups: [3, 3, 4], placeholder: "+39 312 345 6789" },
  NL: { iso: "NL", dial: "31", groups: [2, 4, 4], placeholder: "+31 6 1234 5678" },
  BE: { iso: "BE", dial: "32", groups: [3, 2, 2, 2], placeholder: "+32 470 12 34 56" },
  PL: { iso: "PL", dial: "48", groups: [3, 3, 3], placeholder: "+48 512 345 678" },
  CZ: { iso: "CZ", dial: "420", groups: [3, 3, 3], placeholder: "+420 601 123 456" },
  RO: { iso: "RO", dial: "40", groups: [3, 3, 3], placeholder: "+40 721 123 456" },
  HU: { iso: "HU", dial: "36", groups: [2, 3, 4], placeholder: "+36 20 123 4567" },
  BG: { iso: "BG", dial: "359", groups: [2, 3, 3], placeholder: "+359 87 123 456" },
  GR: { iso: "GR", dial: "30", groups: [3, 3, 4], placeholder: "+30 691 234 5678" },
  TR: { iso: "TR", dial: "90", groups: [3, 3, 4], placeholder: "+90 532 123 4567" },
  IL: { iso: "IL", dial: "972", groups: [2, 3, 4], placeholder: "+972 50 123 4567" },
  AE: { iso: "AE", dial: "971", groups: [2, 3, 4], placeholder: "+971 50 123 4567" },
  SA: { iso: "SA", dial: "966", groups: [2, 3, 4], placeholder: "+966 50 123 4567" },
  IN: { iso: "IN", dial: "91", groups: [5, 5], placeholder: "+91 98765 43210" },
  BR: { iso: "BR", dial: "55", groups: [2, 5, 4], placeholder: "+55 11 91234 5678" },
  MX: { iso: "MX", dial: "52", groups: [3, 3, 4], placeholder: "+52 55 1234 5678" },
  AR: { iso: "AR", dial: "54", groups: [2, 4, 4], placeholder: "+54 11 1234 5678" },
  NG: { iso: "NG", dial: "234", groups: [3, 3, 4], placeholder: "+234 802 123 4567" },
  ZA: { iso: "ZA", dial: "27", groups: [2, 3, 4], placeholder: "+27 82 123 4567" },
  ID: { iso: "ID", dial: "62", groups: [3, 4, 4], placeholder: "+62 812 3456 7890" },
  PH: { iso: "PH", dial: "63", groups: [3, 3, 4], placeholder: "+63 917 123 4567" },
  VN: { iso: "VN", dial: "84", groups: [3, 3, 4], placeholder: "+84 91 234 5678" },
  TH: { iso: "TH", dial: "66", groups: [2, 3, 4], placeholder: "+66 81 234 5678" },
  AU: { iso: "AU", dial: "61", groups: [3, 3, 3], placeholder: "+61 412 345 678" },
  CN: { iso: "CN", dial: "86", groups: [3, 4, 4], placeholder: "+86 138 1234 5678" },
  JP: { iso: "JP", dial: "81", groups: [2, 4, 4], placeholder: "+81 90 1234 5678" },
  KR: { iso: "KR", dial: "82", groups: [2, 4, 4], placeholder: "+82 10 1234 5678" },
};

const LOCALE_FALLBACK: Record<string, string> = {
  ru: "RU",
  uk: "UA",
  de: "DE",
  es: "ES",
  pt: "PT",
  tr: "TR",
  en: "US",
  fr: "FR",
  zh: "CN",
  hi: "IN",
  ar: "AE",
  ja: "JP",
  id: "ID",
  ko: "KR",
  it: "IT",
  vi: "VN",
};

function nationalLen(rule: PhoneRule) {
  return rule.groups.reduce((s, n) => s + n, 0);
}

export function phoneRule(country?: string | null, locale?: string | null): PhoneRule {
  const iso = (country || "").toUpperCase();
  if (iso && RULES[iso]) return RULES[iso]!;
  const fromLocale = LOCALE_FALLBACK[(locale || "").slice(0, 2)] || "US";
  return RULES[fromLocale] ?? RULES.US!;
}

export function formatPhoneInput(raw: string, rule: PhoneRule) {
  let digits = raw.replace(/\D/g, "");
  if (rule.iso === "RU" || rule.iso === "KZ") {
    if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  }
  if (digits.startsWith(rule.dial)) digits = digits.slice(rule.dial.length);
  digits = digits.slice(0, nationalLen(rule));
  const parts: string[] = [];
  let rest = digits;
  for (const g of rule.groups) {
    if (!rest) break;
    parts.push(rest.slice(0, g));
    rest = rest.slice(g);
  }
  return `+${rule.dial}${parts.length ? ` ${parts.join(" ")}` : ""}`;
}

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isPhoneComplete(value: string, rule: PhoneRule) {
  return phoneDigits(value).length === rule.dial.length + nationalLen(rule);
}

export const NAME_RE = /^[\p{L}]{2,80}$/u;

export function sanitizeName(raw: string) {
  return raw.replace(/[^\p{L}]/gu, "").slice(0, 80);
}

export function isValidName(raw: string) {
  return NAME_RE.test(raw.trim());
}

export function isValidEmail(raw: string) {
  const s = raw.trim();
  if (s.length < 6 || s.length > 120) return false;
  if (s.includes("..") || s.startsWith(".") || s.endsWith(".")) return false;
  return /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,24})+$/.test(
    s,
  );
}
