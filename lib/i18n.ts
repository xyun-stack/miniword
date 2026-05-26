export type Locale = "en" | "ko" | "ja";

export const LOCALES: Locale[] = ["en", "ko", "ja"];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "ENG",
  ko: "KOR",
  ja: "JPN"
};

const TRANSLATIONS: Record<string, Record<Locale, string>> = {
  // Header / Nav
  "nav.discover":   { en: "Discover", ko: "둘러보기", ja: "ディスカバー" },
  "nav.browse":     { en: "Browse",   ko: "탐색",     ja: "ブラウズ" },
  "nav.packs":      { en: "Packs",    ko: "팩",       ja: "パック" },
  "nav.uploaded":   { en: "Uploaded", ko: "내 업로드", ja: "投稿済" },
  "nav.upload":     { en: "Upload",   ko: "올리기",   ja: "投稿" },

  // Hero
  "hero.title.pre":    { en: "Motion, made to ",                                    ko: "딱 맞게 만든 ",                                ja: "ぴったり合わせた" },
  "hero.title.accent": { en: "fit.",                                                 ko: "모션.",                                         ja: "モーション。" },
  "hero.subtitle.1":   { en: "A motion library for LCD keypads.",                    ko: "LCD 키패드를 위한 모션 라이브러리.",            ja: "LCDキーパッドのためのモーションライブラリ。" },
  "hero.subtitle.2":   { en: "Sized to fit. Ready to drop in.",                      ko: "딱 맞는 사이즈. 바로 사용 가능.",               ja: "サイズはぴったり。すぐに使えます。" },

  // Section: Featured
  "section.featured.eyebrow": { en: "Featured",            ko: "주목",         ja: "注目" },
  "section.featured.title":   { en: "This week's picks.",  ko: "이번 주의 선택.", ja: "今週のピック。" },
  "section.featured.tail":    { en: "View all",            ko: "전체 보기",    ja: "すべて見る" },

  // Section: Designed for
  "section.designed.eyebrow": { en: "Designed for",                 ko: "디바이스 맞춤",                 ja: "対応デバイス" },
  "section.designed.title":   { en: "One library. Every device.",   ko: "하나의 라이브러리, 모든 디바이스.", ja: "ひとつのライブラリ。すべてのデバイスへ。" },

  // Section: xpad mini row
  "section.xpad.eyebrow": { en: "xpad mini",         ko: "xpad mini",   ja: "xpad mini" },
  "section.xpad.title":   { en: "Landscape motion.", ko: "가로형 모션.", ja: "ランドスケープモーション。" },
  "section.xpad.tail":    { en: "See all",           ko: "전체",         ja: "すべて見る" },

  // Section: StreamDock row
  "section.sd.eyebrow":   { en: "StreamDock",     ko: "StreamDock",  ja: "StreamDock" },
  "section.sd.title":     { en: "Square motion.", ko: "정사각형 모션.", ja: "スクエアモーション。" },

  // CTA
  "cta.title":    { en: "1100+ motions, ready to drop in.",                                                              ko: "1100+ 모션, 바로 사용 가능.",                                                  ja: "1100+のモーション、すぐに使えます。" },
  "cta.subtitle": { en: "Filter by device, mood, motion. Or upload your own. Sized for every supported keypad.",         ko: "디바이스 · 분위기 · 모션으로 필터. 본인 작품도 업로드 가능. 지원 키패드에 맞춤.", ja: "デバイス・ムード・モーションで絞り込み。自分の作品もアップロード可能。" },
  "cta.browse":   { en: "Browse all",     ko: "전체 탐색",   ja: "すべてブラウズ" },
  "cta.upload":   { en: "Upload yours",   ko: "내 작품 올리기", ja: "投稿する" },

  // Button labels
  "btn.browse": { en: "Browse", ko: "탐색", ja: "ブラウズ" },
  "btn.upload": { en: "Upload", ko: "올리기", ja: "投稿" },

  // Device card meta
  "device.preview.size": { en: "Preview size", ko: "프리뷰 사이즈", ja: "プレビューサイズ" }
};

export function t(locale: Locale, key: string): string {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[locale] ?? entry[DEFAULT_LOCALE] ?? key;
}

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "ko" || v === "ja";
}
