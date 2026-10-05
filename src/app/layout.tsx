import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { detectLocaleFromHeader } from "@/lib/i18n";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Domonet",
  description: "Traffic desk",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = detectLocaleFromHeader((await headers()).get("accept-language"));
  return (
    <html lang={locale} className={`${plex.variable} ${plexMono.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
