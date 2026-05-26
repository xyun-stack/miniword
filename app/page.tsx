import Link from "next/link";
import { Surface } from "@/components/glass/Surface";
import { GifCard } from "@/components/GifCard";
import { DeviceFrame } from "@/components/DeviceFrame";
import { DEVICES } from "@/lib/devices";
import { SAMPLE_GIFS, gifsByDevice, type GifItem } from "@/lib/sample-data";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

// Preview tag picks per device. streamdock-32 has no native GIFs in our
// crawl (the classifier only assigns xpad-mini or streamdock-15), so we
// borrow a square GIF that reads well at small icon sizes.
// xpad-mini and streamdock-15 favour bishōjo (female character) GIFs.
const PREVIEW_TAGS: Record<string, string[]> = {
  "xpad-mini": ["chibi", "magicalgirl", "kawaii", "yourname", "miku"],
  "streamdock-15": ["chibi", "kawaii", "miku", "vocaloid"],
  "streamdock-32": ["pixel", "kawaii", "pokemon", "mario"]
};

function devicePreview(deviceId: string): GifItem | undefined {
  const lookupDevice = deviceId === "streamdock-32" ? "streamdock-15" : deviceId;
  const tags = PREVIEW_TAGS[deviceId] ?? [];
  for (const tag of tags) {
    const found = SAMPLE_GIFS.find(
      (g) => g.romaji === tag && g.device === lookupDevice
    );
    if (found) return found;
  }
  return SAMPLE_GIFS.find((g) => g.device === lookupDevice);
}

const FEATURED_COUNT = 5;
const ROW_A_COUNT = 18;
const ROW_B_COUNT = 24;

export default async function DiscoverPage() {
  const locale = await getLocale();
  // Hero anchors: three chibi picks — one landscape for the centre device,
  // two square for the flanking devices. Falls back through related tags
  // so the hero stays populated even if a re-crawl drops some items.
  const chibiLandscape = SAMPLE_GIFS.filter(
    (g) => g.romaji === "chibi" && g.device === "xpad-mini"
  );
  const chibiSquare = SAMPLE_GIFS.filter(
    (g) => g.romaji === "chibi" && g.device === "streamdock-15"
  );
  const kawaiiSquare = SAMPLE_GIFS.filter(
    (g) => g.romaji === "kawaii" && g.device === "streamdock-15"
  );
  const heroMini =
    chibiLandscape[0] ??
    SAMPLE_GIFS.find((g) => g.romaji === "kawaii" && g.device === "xpad-mini") ??
    SAMPLE_GIFS.find((g) => g.device === "xpad-mini") ??
    SAMPLE_GIFS[0];
  const heroSquare =
    chibiSquare[0] ??
    kawaiiSquare[0] ??
    SAMPLE_GIFS.find((g) => g.device === "streamdock-15") ??
    SAMPLE_GIFS[1];
  const heroSquare2 =
    SAMPLE_GIFS.find((g) => g.slug === "chibi-15241833") ??
    chibiSquare[1] ??
    kawaiiSquare[0] ??
    SAMPLE_GIFS.find(
      (g) => g.device === "streamdock-15" && g.id !== heroSquare.id
    ) ??
    SAMPLE_GIFS[2];

  // Featured: bishōjo / female-character picks, all xpad-mini (landscape)
  // so the row reads as a single uniform widescreen grid.
  const FEATURED_TAGS = ["magicalgirl", "yourname", "mononoke", "spirited", "lain"];
  const featured = FEATURED_TAGS
    .map((tag) =>
      SAMPLE_GIFS.find((g) => g.romaji === tag && g.device === "xpad-mini")
    )
    .filter((g): g is (typeof SAMPLE_GIFS)[number] => Boolean(g));
  const xpadRow = gifsByDevice("xpad-mini").slice(0, ROW_A_COUNT);
  const squareRow = gifsByDevice("streamdock-15").slice(0, ROW_B_COUNT);

  return (
    <div className="space-y-28 pb-12">
      {/* ─────────────── HERO ─────────────── */}
      <section className="pt-6 text-center md:pt-12">
        <h1
          className="mx-auto max-w-3xl text-balance text-[clamp(2.8rem,8vw,6rem)] font-semibold leading-[1.02] tracking-[-0.025em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t(locale, "hero.title.pre")}
          <span style={{ color: "var(--color-ink-muted)" }}>
            {t(locale, "hero.title.accent")}
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-[17px] leading-relaxed text-[color:var(--color-ink-muted)]">
          {t(locale, "hero.subtitle.1")}
          <br className="hidden md:inline" />
          {t(locale, "hero.subtitle.2")}
        </p>

        {/* Hero showcase — landscape xpad-mini centered, squares flanking */}
        <div className="relative mx-auto mt-12 flex max-w-5xl items-center justify-center gap-4 sm:gap-6 md:gap-8">
          <div className="w-[96px] sm:w-[120px] md:w-[140px]">
            <Surface variant="strong" className="p-2.5">
              <DeviceFrame
                deviceId={heroSquare.device}
                src={heroSquare.gif_url}
                fallbackPattern={heroSquare.fallbackPattern}
                alt={heroSquare.title}
                priority
              />
            </Surface>
          </div>
          <div className="w-[230px] sm:w-[320px] md:w-[400px]">
            <Surface variant="strong" className="p-3">
              <DeviceFrame
                deviceId={heroMini.device}
                src={heroMini.gif_url}
                fallbackPattern={heroMini.fallbackPattern}
                alt={heroMini.title}
                priority
              />
            </Surface>
          </div>
          <div className="w-[96px] sm:w-[120px] md:w-[140px]">
            <Surface variant="strong" className="p-2.5">
              <DeviceFrame
                deviceId={heroSquare2.device}
                src={heroSquare2.gif_url}
                fallbackPattern={heroSquare2.fallbackPattern}
                alt={heroSquare2.title}
                priority
              />
            </Surface>
          </div>
        </div>
      </section>

      {/* ─────────────── FEATURED ─────────────── */}
      <section>
        <SectionTitle
          eyebrow={t(locale, "section.featured.eyebrow")}
          title={t(locale, "section.featured.title")}
          tail={t(locale, "section.featured.tail")}
          tailHref="/browse"
        />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-5">
          {featured.map((g, i) => (
            <GifCard key={g.id} gif={g} priority={i < 4} showStamp={i < 2} size="md" />
          ))}
        </div>
      </section>

      {/* ─────────────── DEVICES ─────────────── */}
      <section>
        <SectionTitle
          eyebrow={t(locale, "section.designed.eyebrow")}
          title={t(locale, "section.designed.title")}
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DEVICES.map((d) => {
            const sample = devicePreview(d.id);
            const isLandscape = d.width > d.height;
            return (
              <Link key={d.id} href={`/browse?device=${d.id}`} className="group">
                <Surface variant="strong" className="overflow-hidden p-0 card-hover">
                  <div
                    className="flex items-center justify-center p-8"
                    style={{ minHeight: 180 }}
                  >
                    <div style={{ width: isLandscape ? 160 : 96 }}>
                      <DeviceFrame
                        deviceId={d.id}
                        src={sample?.gif_url}
                        fallbackPattern={sample?.fallbackPattern}
                        alt={d.label}
                      />
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-1 text-center">
                    <p className="text-[15px] font-medium tracking-tight">
                      {d.label}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[color:var(--color-ink-muted)]">
                      {d.width} × {d.height}
                    </p>
                  </div>
                </Surface>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─────────────── XPAD-MINI ROW ─────────────── */}
      <section>
        <SectionTitle
          eyebrow={t(locale, "section.xpad.eyebrow")}
          title={t(locale, "section.xpad.title")}
          tail={t(locale, "section.xpad.tail")}
          tailHref="/browse?device=xpad-mini"
        />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {xpadRow.map((g) => (
            <GifCard key={g.id} gif={g} />
          ))}
        </div>
      </section>


      {/* ─────────────── STREAMDOCK ROW ─────────────── */}
      <section>
        <SectionTitle
          eyebrow={t(locale, "section.sd.eyebrow")}
          title={t(locale, "section.sd.title")}
          tail={t(locale, "section.xpad.tail")}
          tailHref="/browse?device=streamdock-15"
        />
        <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {squareRow.map((g) => (
            <GifCard key={g.id} gif={g} />
          ))}
        </div>
      </section>

      {/* ─────────────── CTA ─────────────── */}
      <section className="pt-4 text-center">
        <h2
          className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t(locale, "cta.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] text-[color:var(--color-ink-muted)]">
          {t(locale, "cta.subtitle")}
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link href="/browse" className="btn-primary">
            {t(locale, "cta.browse")}
          </Link>
          <Link href="/upload" className="btn-secondary">
            {t(locale, "cta.upload")}
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  tail,
  tailHref
}: {
  eyebrow: string;
  title: string;
  tail?: string;
  tailHref?: string;
}) {
  return (
    <div className="flex items-end justify-between pb-2">
      <div>
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
          <span aria-hidden className="pink-dot" />
          {eyebrow}
        </p>
        <h2
          className="mt-1 text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
      </div>
      {tail && tailHref && (
        <Link
          href={tailHref}
          className="link-underline text-[13px] text-[color:var(--color-ink-muted)]"
        >
          {tail}
        </Link>
      )}
    </div>
  );
}
