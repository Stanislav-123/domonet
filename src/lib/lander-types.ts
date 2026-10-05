export const LANDER_TYPE_VALUES = [
  "price_guess",
  "price_candles",
  "ai_agents",
  "profit_calc",
  "quiz",
  "live_signals",
  "copy_desk",
  "airdrop",
  "vault",
  "briefing",
] as const;

export const LANDER_TYPE_OPTIONS: { type: (typeof LANDER_TYPE_VALUES)[number]; label: string }[] = [
  { type: "price_guess", label: "Биржа: направление" },
  { type: "price_candles", label: "Биржа: свечи" },
  { type: "ai_agents", label: "Платформа / регистрация" },
  { type: "profit_calc", label: "Счёт потенциала" },
  { type: "quiz", label: "Квиз инвестора" },
  { type: "live_signals", label: "Live-сигналы" },
  { type: "copy_desk", label: "Копирование сделок" },
  { type: "airdrop", label: "Аллокация / airdrop" },
  { type: "vault", label: "Волт доходности" },
  { type: "briefing", label: "Утренний брифинг" },
];
