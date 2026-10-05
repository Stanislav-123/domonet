export const COUNTRIES = [
  { code: "RU", name: "Россия" },
  { code: "UA", name: "Украина" },
  { code: "KZ", name: "Казахстан" },
  { code: "BY", name: "Беларусь" },
  { code: "UZ", name: "Узбекистан" },
  { code: "AZ", name: "Азербайджан" },
  { code: "GE", name: "Грузия" },
  { code: "AM", name: "Армения" },
  { code: "MD", name: "Молдова" },
  { code: "KG", name: "Кыргызстан" },
  { code: "TJ", name: "Таджикистан" },
  { code: "TR", name: "Турция" },
  { code: "DE", name: "Германия" },
  { code: "PL", name: "Польша" },
  { code: "CZ", name: "Чехия" },
  { code: "US", name: "США" },
  { code: "GB", name: "Великобритания" },
  { code: "IN", name: "Индия" },
  { code: "BR", name: "Бразилия" },
  { code: "NG", name: "Нигерия" },
  { code: "ID", name: "Индонезия" },
  { code: "PH", name: "Филиппины" },
  { code: "VN", name: "Вьетнам" },
  { code: "TH", name: "Таиланд" },
  { code: "AE", name: "ОАЭ" },
] as const;

export function countryName(code?: string | null) {
  if (!code || code === "??" || code === "unknown") return "??";
  const hit = COUNTRIES.find((c) => c.code === code);
  return hit ? `${code} · ${hit.name}` : code;
}
