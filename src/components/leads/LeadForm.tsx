"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import {
  formatPhoneInput,
  isPhoneComplete,
  isValidEmail,
  isValidName,
  phoneRule,
  sanitizeName,
} from "@/lib/phone";

type Props = {
  landerId: string;
  clickId?: string | null;
  country?: string | null;
  cta?: string;
  onFocus?: () => void;
};

type Field = "firstName" | "lastName" | "email" | "phone";

export function LeadForm({ landerId, clickId, country, cta, onFocus }: Props) {
  const { t, locale } = useT();
  const [geo, setGeo] = useState(country || "");
  const rule = useMemo(() => phoneRule(geo || country, locale), [geo, country, locale]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(() => formatPhoneInput("", rule));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (country) setGeo(country);
  }, [country]);

  useEffect(() => {
    if (geo || country) return;
    let cancelled = false;
    fetch("https://ipwho.is/")
      .then((r) => r.json())
      .then((data: { success?: boolean; country_code?: string }) => {
        if (!cancelled && data?.success && data.country_code) setGeo(data.country_code);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [geo, country]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhone((prev) => formatPhoneInput(prev, rule));
  }, [rule]);

  function validate() {
    const next: Partial<Record<Field, string>> = {};
    if (!isValidName(firstName)) next.firstName = t("form.err.name");
    if (!isValidName(lastName)) next.lastName = t("form.err.name");
    if (!isValidEmail(email)) next.email = t("form.err.email");
    if (!isPhoneComplete(phone, rule)) next.phone = t("form.err.phone");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setPending(true);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone,
      clickId,
      landerId,
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("form.error"));
        setPending(false);
        return;
      }
      window.location.href = "/thanks";
    } catch {
      setError(t("form.net"));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} onFocus={onFocus} className="panel w-full space-y-2 p-4" noValidate>
      <div className="grid grid-cols-2 gap-2">
        <FieldBox error={errors.firstName}>
          <input
            name="firstName"
            value={firstName}
            onChange={(e) => {
              setFirstName(sanitizeName(e.target.value));
              setErrors((prev) => ({ ...prev, firstName: undefined }));
            }}
            autoComplete="given-name"
            inputMode="text"
            placeholder={t("form.ph.firstName")}
            className="field"
          />
        </FieldBox>
        <FieldBox error={errors.lastName}>
          <input
            name="lastName"
            value={lastName}
            onChange={(e) => {
              setLastName(sanitizeName(e.target.value));
              setErrors((prev) => ({ ...prev, lastName: undefined }));
            }}
            autoComplete="family-name"
            inputMode="text"
            placeholder={t("form.ph.lastName")}
            className="field"
          />
        </FieldBox>
      </div>
      <FieldBox error={errors.email}>
        <input
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value.replace(/\s/g, ""));
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          autoComplete="email"
          inputMode="email"
          placeholder={t("form.ph.email")}
          className="field"
        />
      </FieldBox>
      <FieldBox error={errors.phone}>
        <input
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(formatPhoneInput(e.target.value, rule));
            setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          autoComplete="tel"
          inputMode="tel"
          placeholder={rule.placeholder}
          className="field"
        />
      </FieldBox>
      {error ? <p className="text-sm text-[var(--bad)]">{error}</p> : null}
      <button disabled={pending} className="btn w-full">
        {pending ? t("form.sending") : cta || t("form.send")}
      </button>
    </form>
  );
}

function FieldBox({ children, error }: { children: ReactNode; error?: string }) {
  return (
    <div className="space-y-1">
      {children}
      {error ? <p className="text-[11px] leading-tight text-[var(--bad)]">{error}</p> : null}
    </div>
  );
}
