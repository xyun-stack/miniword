"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { LOCALES, type Locale } from "@/lib/i18n";

const NATIVE: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語"
};

const REGION: Record<Locale, string> = {
  en: "EN",
  ko: "KO",
  ja: "JA"
};

/**
 * LocaleSwitch — globe icon trigger with a small dropdown panel listing
 * locales in their native script. Click-outside and Escape both close.
 */
export function LocaleSwitch() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(l: Locale) {
    setLocale(l);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Language, ${NATIVE[locale]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors duration-200"
        style={{
          background: open
            ? "var(--color-bg-raised)"
            : "var(--color-bg-soft)",
          color: "var(--color-ink-muted)"
        }}
      >
        <GlobeIcon />
        <span>{REGION[locale]}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-[14px] border"
          style={{
            background: "var(--color-bg)",
            borderColor: "var(--color-line-strong)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)"
          }}
        >
          {LOCALES.map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => choose(code)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors duration-150"
                style={{
                  background: active
                    ? "var(--color-bg-soft)"
                    : "transparent",
                  color: active
                    ? "var(--color-ink)"
                    : "var(--color-ink-muted)",
                  fontWeight: active ? 600 : 500
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.08em]"
                    style={{
                      color: active
                        ? "var(--color-pink-deep)"
                        : "var(--color-ink-faint)"
                    }}
                  >
                    {REGION[code]}
                  </span>
                  <span>{NATIVE[code]}</span>
                </span>
                {active && <span aria-hidden className="pink-dot" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
