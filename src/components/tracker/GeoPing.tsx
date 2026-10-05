"use client";

import { useEffect } from "react";

export function GeoPing({ clickId, country }: { clickId?: string | null; country?: string | null }) {
  useEffect(() => {
    if (!clickId || country) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://ipwho.is/");
        const data = (await res.json()) as {
          success?: boolean;
          country_code?: string;
          ip?: string;
        };
        if (cancelled || !data?.success || !data.country_code) return;
        await fetch("/api/geo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clickId,
            country: data.country_code,
            ip: data.ip,
          }),
        });
      } catch {
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clickId, country]);
  return null;
}
