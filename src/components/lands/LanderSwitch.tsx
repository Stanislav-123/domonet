"use client";

import { useRef } from "react";
import { AiAgentsLand } from "./AiAgentsLand";
import { AirdropLand } from "./AirdropLand";
import { BriefingLand } from "./BriefingLand";
import { CopyDeskLand } from "./CopyDeskLand";
import { LiveSignalsLand } from "./LiveSignalsLand";
import { PriceCandlesLand, PriceGuessLand } from "./PriceGuessLand";
import { ProfitCalcLand } from "./ProfitCalcLand";
import { QuizLand } from "./QuizLand";
import { VaultLand } from "./VaultLand";
import { GeoPing } from "@/components/tracker/GeoPing";

type Props = {
  type: string;
  landerId: string;
  clickId?: string | null;
  country?: string | null;
};

export function LanderSwitch(props: Props) {
  const sent = useRef(false);
  function onFormStart() {
    if (sent.current || !props.clickId) return;
    sent.current = true;
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "form_start", clickId: props.clickId, landerId: props.landerId }),
    }).catch(() => undefined);
  }
  const common = { ...props, onFormStart };
  const land =
    props.type === "price_guess" ? (
      <PriceGuessLand {...common} />
    ) : props.type === "price_candles" ? (
      <PriceCandlesLand {...common} />
    ) : props.type === "profit_calc" ? (
      <ProfitCalcLand {...common} />
    ) : props.type === "quiz" ? (
      <QuizLand {...common} />
    ) : props.type === "live_signals" ? (
      <LiveSignalsLand {...common} />
    ) : props.type === "copy_desk" ? (
      <CopyDeskLand {...common} />
    ) : props.type === "airdrop" ? (
      <AirdropLand {...common} />
    ) : props.type === "vault" ? (
      <VaultLand {...common} />
    ) : props.type === "briefing" ? (
      <BriefingLand {...common} />
    ) : (
      <AiAgentsLand {...common} />
    );

  return (
    <>
      <GeoPing clickId={props.clickId} country={props.country} />
      {land}
    </>
  );
}
