import Link from "next/link";
import { Surface } from "@/components/glass/Surface";
import { GifCard } from "@/components/GifCard";
import { DeviceFrame } from "@/components/DeviceFrame";
import { RecentUploads } from "@/components/RecentUploads";
import { getActiveGifs } from "@/lib/gifs-server";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

const FEATURED_COUNT = 5;
const ROW_A_COUNT = 24;

export default async function DiscoverPage() {
  const locale = await getLocale();
  const activeGifs = await getActiveGifs();

  // Three chibi picks for the hero. All items are projected to xpad-mini
  // device after the pivot, so the lookups no longer split by aspect.
  const chibiItems = activeGifs.filter((g) => g.romaji === "chibi");
  const explicitHero =
    activeGifs.find((g) => g.slug === "chibi-15241833") ?? null;

  const heroMini =
    chibiItems[0] ??
    activeGifs.find((g) => g.romaji === "kawaii") ??
    activeGifs[0];
  const heroSquare =
    chibiItems.find((g) => g.id !== heroMini.id) ??
    activeGifs.find((g) => g.romaji === "kawaii") ??
    activeGifs[1];
  const heroSquare2 =
    explicitHero ??
    chibiItems.find((g) => g.id !== heroMini.id && g.id !== heroSquare.id) ??
    activeGifs.find((g) => g.id !== heroMini.id && g.id !== heroSquare.id) ??
    activeGifs[2];

  // Featured: bishōjo / female-character picks, all xpad-mini (landscape)
  // so the row reads as a single uniform widescreen grid.
  const FEATURED_TAGS = ["magicalgirl", "yourname", "mononoke", "spirited", "lain"];
  const featured = FEATURED_TAGS
    .map((tag) => activeGifs.find((g) => g.romaji === tag))
    .filter((g): g is (typeof activeGifs)[number] => Boolean(g));
  const xpadRow = activeGifs.filter((g) => g.device === "xpad-mini").slice(0, ROW_A_COUNT);

  return (
    <div className="space-y-28 pb-12">
      {/* ─────────────── HERO ─────────────── */}
      <section className="pt-6 text-center md:pt-12">
        <h1
          className="mx-auto max-w-3xl text-balance text-[clamp(2.8rem,8vw,6rem)] font-semibold leading-[1.02] tracking-[-0.025em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t(locale, "hero.title.pre")}
          <span style={{ color: "var(--color-pink-mid)" }}>
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

      {/* ─────────────── COMMUNITY UPLOADS ─────────────── */}
      <RecentUploads limit={12} />

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

      {/* ─────────────── CTA ─────────────── */}
      <section className="pt-4 text-center">
        <h2
          className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {activeGifs.length}+ motions, ready to drop in.
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
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
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
