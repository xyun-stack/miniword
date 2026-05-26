import Link from "next/link";
import { Surface } from "@/components/glass/Surface";
import { GifCard } from "@/components/GifCard";
import { SearchBar } from "@/components/SearchBar";
import { TagPills } from "@/components/TagPills";
import { UploadedMatches } from "@/components/UploadedMatches";
import { DEVICES, findDevice } from "@/lib/devices";
import {
  SAMPLE_GIFS,
  SAMPLE_PACKS,
  CATEGORY_LABELS,
  tagsByCategory,
  categoryOfTag,
  type Category,
  type Mood,
  type Motion
} from "@/lib/sample-data";

type SortKey = "curated" | "popular";

type SearchParams = Promise<{
  device?: string;
  mood?: Mood;
  motion?: Motion;
  category?: Category;
  tag?: string;
  pack?: string;
  sort?: SortKey;
  page?: string;
  q?: string;
}>;

const PAGE_SIZE = 90;

const MOODS: Array<{ id: Mood; label: string }> = [
  { id: "calm", label: "Calm" },
  { id: "loud", label: "Loud" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "mono", label: "Mono" }
];

const MOTIONS: Array<{ id: Motion; label: string }> = [
  { id: "subtle", label: "Subtle" },
  { id: "medium", label: "Medium" },
  { id: "active", label: "Active" }
];

const CATEGORIES: Category[] = ["anime", "game", "aesthetic", "character"];

export default async function BrowsePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  // Default device view is xpad-mini. Users opt out via the "All" pill,
  // which sets ?device=all explicitly.
  const deviceParam = (params.device && params.device.length > 0)
    ? params.device
    : "xpad-mini";
  const isAllDevices = deviceParam === "all";
  const deviceFilterId = isAllDevices ? null : deviceParam;
  const device = findDevice(deviceFilterId ?? "xpad-mini");

  const activeMood = params.mood;
  const activeMotion = params.motion;
  const activeCategory = params.category;
  const activeTag = params.tag;
  const activeSort: SortKey = params.sort === "popular" ? "popular" : "curated";
  const activePack = params.pack
    ? SAMPLE_PACKS.find((p) => p.slug === params.pack)
    : null;

  const q = (params.q ?? "").trim();
  const qNeedle = q.toLowerCase().replace(/^@/, "");

  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const filtered = SAMPLE_GIFS.filter((g) => {
    if (deviceFilterId && g.device !== deviceFilterId) return false;
    if (activeMood && g.mood !== activeMood) return false;
    if (activeMotion && g.motion !== activeMotion) return false;
    if (activeCategory && g.category !== activeCategory) return false;
    if (activeTag && g.romaji !== activeTag) return false;
    if (activePack && !activePack.gifIds.includes(g.id)) return false;
    if (qNeedle) {
      const hay = `${g.title} ${g.romaji} ${g.author}`.toLowerCase();
      if (!hay.includes(qNeedle)) return false;
    }
    return true;
  });

  const sorted =
    activeSort === "popular"
      ? [...filtered].sort((a, b) => a.rank - b.rank)
      : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);

  // Show the Tag row only when a category is active (explicit or implied
  // by an active tag). Otherwise the row would dump all 50 tags into the
  // surface, which is overwhelming.
  const effectiveCategory: Category | null =
    activeCategory ?? (activeTag ? categoryOfTag(activeTag) : null);
  const tagsForRow = effectiveCategory ? tagsByCategory(effectiveCategory) : [];

  const buildHref = (
    next: Partial<{
      device: string;
      mood: Mood | "";
      motion: Motion | "";
      category: Category | "";
      tag: string | "";
      pack: string | "";
      sort: SortKey | "";
      page: number;
      q: string | "";
    }>
  ) => {
    const sp = new URLSearchParams();
    const d = next.device ?? params.device;
    const m = next.mood ?? activeMood;
    const mv = next.motion ?? activeMotion;
    const ca = next.category ?? activeCategory;
    const tg = next.tag ?? activeTag;
    const pk = next.pack ?? params.pack;
    const so = next.sort ?? (activeSort === "curated" ? "" : activeSort);
    const pg = next.page ?? safePage;
    const qq = next.q ?? q;
    if (d) sp.set("device", d);
    if (m) sp.set("mood", m);
    if (mv) sp.set("motion", mv);
    if (ca) sp.set("category", ca);
    if (tg) sp.set("tag", tg);
    if (pk) sp.set("pack", pk);
    if (so) sp.set("sort", so);
    if (pg && pg !== 1) sp.set("page", String(pg));
    if (qq) sp.set("q", qq);
    const qs = sp.toString();
    return qs ? `/browse?${qs}` : "/browse";
  };

  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Browse
        </p>
        <h1
          className="mt-2 text-[clamp(2rem,4vw,2.8rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {q
            ? `"${q}"`
            : activePack
            ? activePack.title
            : activeTag
            ? `#${activeTag}`
            : activeCategory
            ? CATEGORY_LABELS[activeCategory]
            : isAllDevices
            ? "The library."
            : device.label}
        </h1>
        <p className="mt-2 text-[13px] text-[color:var(--color-ink-muted)]">
          {sorted.length} results
          {!isAllDevices ? ` · ${device.width} × ${device.height}` : ""}
          {totalPages > 1 ? ` · page ${safePage} of ${totalPages}` : ""}
        </p>
      </div>

      <SearchBar
        q={q}
        clearHref={buildHref({ q: "", page: 1 })}
        preserveParams={{
          device: params.device,
          mood: activeMood,
          motion: activeMotion,
          category: activeCategory,
          tag: activeTag,
          pack: params.pack,
          sort: activeSort === "curated" ? undefined : activeSort
        }}
      />

      <div className="flex items-center justify-center">
        <SortToggle
          active={activeSort}
          curatedHref={buildHref({ sort: "", page: 1 })}
          popularHref={buildHref({ sort: "popular", page: 1 })}
        />
      </div>

      <Surface variant="strong" className="px-5 py-4">
        <div className="space-y-3">
          <FilterRow label="Category">
            <Link
              href={buildHref({ category: "", tag: "", page: 1 })}
              className="pill"
              data-active={!activeCategory}
            >
              All
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={buildHref({ category: c, tag: "", page: 1 })}
                className="pill"
                data-active={activeCategory === c}
              >
                {CATEGORY_LABELS[c]}
              </Link>
            ))}
          </FilterRow>

          {effectiveCategory && (
            <FilterRow label="Tag">
              <TagPills
                activeTag={activeTag}
                tags={tagsForRow}
                anyHref={buildHref({ tag: "", page: 1 })}
                tagHref={(t) => buildHref({ tag: t, page: 1 })}
              />
            </FilterRow>
          )}

          <FilterRow label="Device">
            <Link
              href={buildHref({ device: "all", page: 1 })}
              className="pill"
              data-active={isAllDevices}
            >
              All
            </Link>
            {DEVICES.map((d) => (
              <Link
                key={d.id}
                href={buildHref({ device: d.id, page: 1 })}
                className="pill"
                data-active={deviceParam === d.id && !isAllDevices}
              >
                {d.label}
              </Link>
            ))}
          </FilterRow>

          <FilterRow label="Mood">
            <Link href={buildHref({ mood: "", page: 1 })} className="pill" data-active={!activeMood}>
              Any
            </Link>
            {MOODS.map((m) => (
              <Link
                key={m.id}
                href={buildHref({ mood: m.id, page: 1 })}
                className="pill"
                data-active={activeMood === m.id}
              >
                {m.label}
              </Link>
            ))}
          </FilterRow>

          <FilterRow label="Motion">
            <Link
              href={buildHref({ motion: "", page: 1 })}
              className="pill"
              data-active={!activeMotion}
            >
              Any
            </Link>
            {MOTIONS.map((m) => (
              <Link
                key={m.id}
                href={buildHref({ motion: m.id, page: 1 })}
                className="pill"
                data-active={activeMotion === m.id}
              >
                {m.label}
              </Link>
            ))}
          </FilterRow>

          {activePack && (
            <FilterRow label="Pack">
              <Link
                href={buildHref({ pack: "", page: 1 })}
                className="pill"
                data-active
              >
                {activePack.title} ×
              </Link>
            </FilterRow>
          )}
        </div>
      </Surface>

      <UploadedMatches device={deviceParam} q={q} />

      {sorted.length === 0 ? (
        <Surface className="px-6 py-16 text-center">
          <p className="text-[14px] text-[color:var(--color-ink-muted)]">
            Nothing matches yet.
          </p>
          <Link href="/upload" className="btn-primary mt-4 inline-flex">
            Upload one
          </Link>
        </Surface>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {pageItems.map((g, i) => (
              <GifCard key={g.id} gif={g} priority={i < 6} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              buildHref={(p) => buildHref({ page: p })}
            />
          )}
        </>
      )}
    </div>
  );
}

function SortToggle({
  active,
  curatedHref,
  popularHref
}: {
  active: SortKey;
  curatedHref: string;
  popularHref: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Sort"
      className="inline-flex items-center rounded-full p-1"
      style={{ background: "var(--color-bg-soft)" }}
    >
      <SortToggleItem href={curatedHref} active={active === "curated"} label="Curated" />
      <SortToggleItem href={popularHref} active={active === "popular"} label="Popular" />
    </div>
  );
}

function SortToggleItem({
  href,
  active,
  label
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className="inline-flex h-8 items-center rounded-full px-4 text-[12.5px] font-medium transition-colors duration-200 ease-out"
      style={{
        background: active ? "var(--color-pink)" : "transparent",
        color: active ? "var(--color-ink)" : "var(--color-ink-muted)",
        border: "1px solid transparent",
        fontWeight: active ? 600 : 500
      }}
    >
      {label}
    </Link>
  );
}

function FilterRow({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 w-16 shrink-0 text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  buildHref
}: {
  page: number;
  totalPages: number;
  buildHref: (p: number) => string;
}) {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const ordered = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav
      className="flex items-center justify-center gap-2 pt-6"
      aria-label="pagination"
    >
      <Link
        href={buildHref(Math.max(1, page - 1))}
        className="pill"
        aria-disabled={page === 1}
      >
        ←
      </Link>
      {ordered.map((p, idx) => {
        const prev = ordered[idx - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {showEllipsis && (
              <span className="px-1 text-[12px] text-[color:var(--color-ink-muted)]">
                ⋯
              </span>
            )}
            <Link href={buildHref(p)} className="pill" data-active={p === page}>
              {p}
            </Link>
          </span>
        );
      })}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        className="pill"
        aria-disabled={page === totalPages}
      >
        →
      </Link>
    </nav>
  );
}
