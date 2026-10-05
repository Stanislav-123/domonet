"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";

type Props = {
  clickId: string;
  landerUrl: string;
};

export function BackExitTracker({ clickId, landerUrl }: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    history.pushState({ dm: 1 }, "", location.href);

    const onPop = () => {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "back_button", clickId }),
        keepalive: true,
      }).catch(() => undefined);
      location.replace(landerUrl);
    };
    window.addEventListener("popstate", onPop);

    const shownKey = `dm_exit_${clickId}`;
    const show = () => {
      if (sessionStorage.getItem(shownKey)) return;
      sessionStorage.setItem(shownKey, "1");
      setOpen(true);
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "exit_shown", clickId }),
      }).catch(() => undefined);
    };

    const onMouse = (e: MouseEvent) => {
      if (e.clientY <= 8) show();
    };
    document.addEventListener("mouseout", onMouse);

    let hiddenAt: number | null = null;
    const onVis = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now();
      if (document.visibilityState === "visible" && hiddenAt && Date.now() - hiddenAt > 12000) {
        show();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("mouseout", onMouse);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [clickId, landerUrl]);

  function close() {
    setOpen(false);
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "exit_closed", clickId }),
    }).catch(() => undefined);
  }

  function go() {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "exit_clicked", clickId }),
      keepalive: true,
    }).catch(() => undefined);
    location.href = landerUrl;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="panel w-full max-w-md p-5">
        <h3 className="text-2xl font-semibold">{t("popup.title")}</h3>
        <p className="mt-3 text-sm text-[var(--dim)]">{t("popup.text")}</p>
        <div className="mt-5 flex flex-col gap-2">
          <button onClick={go} className="btn">{t("popup.cta")}</button>
          <button onClick={close} className="text-sm text-[var(--dim)]">{t("popup.close")}</button>
        </div>
      </div>
    </div>
  );
}
