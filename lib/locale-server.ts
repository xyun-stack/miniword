import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n";

export const LOCALE_COOKIE = "miniword.locale";

/**
 * Read the persisted locale from the cookie set by LocaleSwitch.
 * Falls back to DEFAULT_LOCALE when no/invalid cookie is present.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}
