"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { detectLocale, t as translate, type Locale } from "@/lib/i18n";

const I18nContext = createContext<{
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
}>({
  locale: "en",
  t: (key, vars) => translate("en", key, vars),
});

export function I18nProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return initialLocale;
    return detectLocale(navigator.language || navigator.languages?.[0]);
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      t: (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext);
}
