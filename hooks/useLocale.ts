"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

const COOKIE = "miniword.locale";

function readCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(COOKIE + "="));
  if (!match) return DEFAULT_LOCALE;
  const v = decodeURIComponent(match.split("=")[1] ?? "");
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

function writeCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE}=${locale}; path=/; max-age=${oneYear}; samesite=lax`;
}

/**
 * Locale state shared with the server via cookie. setLocale persists and
 * triggers router.refresh() so server components re-render with the new
 * value without a full reload.
 */
export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readCookie());
  }, []);

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      writeCookie(l);
      router.refresh();
    },
    [router]
  );

  return { locale, setLocale };
}
