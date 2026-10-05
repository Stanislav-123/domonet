"use client";

import { useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { LanderFrame } from "./LanderFrame";
import { useT } from "@/components/i18n/I18nProvider";

type Props = { landerId: string; clickId?: string | null; country?: string | null; onFormStart?: () => void };

export function QuizLand(props: Props) {
  const { t } = useT();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const questions = [
    { q: t("quiz.q1"), a: [t("quiz.q1a1"), t("quiz.q1a2"), t("quiz.q1a3")] },
    { q: t("quiz.q2"), a: [t("quiz.q2a1"), t("quiz.q2a2"), t("quiz.q2a3")] },
    { q: t("quiz.q3"), a: [t("quiz.q3a1"), t("quiz.q3a2"), t("quiz.q3a3")] },
    { q: t("quiz.q4"), a: [t("quiz.q4a1"), t("quiz.q4a2"), t("quiz.q4a3")] },
  ];
  const profiles = [
    { t: t("quiz.r1t"), d: t("quiz.r1d") },
    { t: t("quiz.r2t"), d: t("quiz.r2d") },
    { t: t("quiz.r3t"), d: t("quiz.r3d") },
  ];
  const done = started && step >= questions.length;
  const profile = profiles[Math.min(2, Math.floor(score / 3))];

  return (
    <LanderFrame>
      <p className="kicker">{t("quiz.kicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold">{t("quiz.title")}</h1>
      {!started ? (
        <div className="mt-5 space-y-4">
          <p className="text-[var(--dim)]">{t("quiz.intro")}</p>
          <p className="text-sm text-[var(--dim)]">{t("quiz.intro2")}</p>
          <ul className="space-y-2 text-sm text-[var(--dim)]">
            <li>— {t("quiz.bullet1")}</li>
            <li>— {t("quiz.bullet2")}</li>
            <li>— {t("quiz.bullet3")}</li>
          </ul>
          <button onClick={() => setStarted(true)} className="btn mt-2">
            {t("quiz.start")}
          </button>
        </div>
      ) : !done ? (
        <div className="panel mt-6 p-4">
          <p className="mono text-xs text-[var(--dim)]">{t("quiz.n", { n: step + 1, total: questions.length })}</p>
          <h2 className="mt-2 text-xl">{questions[step]?.q}</h2>
          <div className="mt-4 space-y-2">
            {questions[step]?.a.map((ans, i) => (
              <button
                key={ans}
                onClick={() => {
                  setScore((s) => s + i);
                  setStep((s) => s + 1);
                }}
                className="btn-ghost w-full px-4 py-3 text-left"
              >
                {ans}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="panel p-4">
            <p className="kicker">{t("quiz.result")}</p>
            <p className="mt-1 text-2xl">{profile?.t}</p>
            <p className="mt-2 text-sm text-[var(--dim)]">{profile?.d}</p>
          </div>
          <LeadForm {...props} cta={t("quiz.cta")} onFocus={props.onFormStart} />
        </div>
      )}
    </LanderFrame>
  );
}
