"use client";

import { useLocale } from "@/hooks/useLocale";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";

/**
 * LocaleSwitch — three small text buttons (ENG · KOR · JPN) in the
 * header's right cluster. Click switches the locale, persists via cookie,
 * and refreshes server-rendered content.
 */
export function LocaleSwitch() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Language"
      className="hidden items-center gap-1.5 text-[10.5px] font-medium tracking-[0.1em] sm:inline-flex"
    >
      {LOCALES.map((code, i) => (
        <span key={code} className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={code === locale}
            className="cursor-pointer transition-colors duration-200"
            style={{
              color:
                code === locale
                  ? "var(--color-ink)"
                  : "var(--color-ink-faint)"
            }}
          >
            {LOCALE_LABELS[code as Locale]}
          </button>
          {i < LOCALES.length - 1 && (
            <span aria-hidden style={{ color: "var(--color-ink-faint)" }}>
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
