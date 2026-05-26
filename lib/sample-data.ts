import seeds from "./seeds.json";

export type Mood = "calm" | "loud" | "warm" | "cool" | "mono";
export type Motion = "subtle" | "medium" | "active";
export type Category = "anime" | "game" | "aesthetic" | "character";

/** Maps each romaji tag to a top-level category. */
const CATEGORY_OF_TAG: Record<string, Category> = {
  // Anime — films, franchises, eras, scenes
  lofi: "anime",
  neon: "anime",
  cyberpunk: "anime",
  evangelion: "anime",
  akira: "anime",
  bebop: "anime",
  ghost: "anime",
  ghibli: "anime",
  mononoke: "anime",
  spirited: "anime",
  yourname: "anime",
  tokyo: "anime",
  shibuya: "anime",
  rain: "anime",
  sakura: "anime",
  lain: "anime",
  trigun: "anime",
  magicalgirl: "anime",
  mecha: "anime",
  filmanime: "anime",
  ova: "anime",
  celanime: "anime",
  opening: "anime",
  retroanime: "anime",
  gundam: "anime",
  jojo: "anime",

  // Game
  pixel: "game",
  pokemon: "game",
  mario: "game",
  sonic: "game",
  nintendo: "game",
  arcade: "game",
  eightbit: "game",
  jrpg: "game",
  visualnovel: "game",
  fighter: "game",
  gacha: "game",
  rhythm: "game",

  // Aesthetic
  vaporwave: "aesthetic",
  synthwave: "aesthetic",
  glitch: "aesthetic",
  mono: "aesthetic",
  sign: "aesthetic",

  // Character
  miku: "character",
  vocaloid: "character",
  chibi: "character",
  kawaii: "character",
  vtuber: "character",
  cat: "character",
  ramen: "character"
};

export const CATEGORY_LABELS: Record<Category, string> = {
  anime: "Anime",
  game: "Game",
  aesthetic: "Aesthetic",
  character: "Character"
};

const MOOD_PALETTE: Record<Mood, string[]> = {
  warm: ["#FFB084", "#F4836A", "#D85F4B", "#FFD8C2", "#8B4332"],
  loud: ["#984691", "#FF4D8D", "#4D8DFF", "#FFE74D", "#0A0A0C"],
  cool: ["#74E6E0", "#5BB4D6", "#3A6FB0", "#9DD8E8", "#1B3E5E"],
  mono: ["#0A0A0B", "#5A5A5E", "#A4A4A8", "#D8D8DA", "#FFFFFF"],
  calm: ["#E6E0F4", "#C9BFE5", "#A89DCC", "#F2EEF9", "#7568A8"]
};

const FALLBACK_PATTERN: Record<Mood, string> = {
  warm: "motion-lofi",
  loud: "motion-neon",
  cool: "motion-cool",
  mono: "motion-mono",
  calm: "motion-paper"
};

type RawSeed = {
  id: string;
  slug: string;
  title: string;
  romaji: string;
  author: string;
  device: string;
  mood: Mood;
  motion: Motion;
  /** 1 = most popular within this query/tag (Tenor returns popular first). */
  rank: number;
  gif_url: string;
  gif_small_url: string;
  poster_url: string | null;
  source_url: string;
  width: number;
  height: number;
  license: string;
};

export type GifItem = RawSeed & {
  palette: string[];
  fallbackPattern: string;
  category: Category;
};

const rawItems = (seeds as { items: RawSeed[] }).items ?? [];

// Representative streamdock-15 slugs that pre-date the xpad-mini-only
// pivot. Kept (and re-classified as xpad-mini for display) so the home
// hero remains intact.
const REPRESENTATIVE_NON_XPAD = new Set<string>(["chibi-15241833"]);
{
  const topChibiSquare = rawItems
    .filter((r) => r.romaji === "chibi" && r.device === "streamdock-15")
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);
  for (const r of topChibiSquare) REPRESENTATIVE_NON_XPAD.add(r.slug);
}

const xpadAndReps: RawSeed[] = rawItems
  .filter(
    (item) =>
      item.device === "xpad-mini" || REPRESENTATIVE_NON_XPAD.has(item.slug)
  )
  // Project all surviving items into the single xpad-mini device so the
  // grid and the hero render with a consistent 240×135 aspect.
  .map((item) => ({ ...item, device: "xpad-mini" }));

export const SAMPLE_GIFS: GifItem[] = xpadAndReps.map((item) => ({
  ...item,
  palette: MOOD_PALETTE[item.mood] ?? MOOD_PALETTE.mono,
  fallbackPattern: FALLBACK_PATTERN[item.mood] ?? "motion-paper",
  category: CATEGORY_OF_TAG[item.romaji] ?? "aesthetic"
}));

/** Unique tag list, ordered by appearance in seeds. */
export const ALL_TAGS: string[] = Array.from(
  new Set(SAMPLE_GIFS.map((g) => g.romaji))
);

/** Tags grouped by category, preserving insertion order. */
export function tagsByCategory(category: Category | null): string[] {
  if (!category) return ALL_TAGS;
  return ALL_TAGS.filter((t) => CATEGORY_OF_TAG[t] === category);
}

/** Look up the category a tag belongs to. */
export function categoryOfTag(tag: string): Category | null {
  return CATEGORY_OF_TAG[tag] ?? null;
}

export type PackItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  curator: string;
  gifIds: string[];
  coverGifId: string;
};

/**
 * Editorial packs — hand-grouped by romaji tag.
 * In production these live in the DB and are curator-authored.
 */
function packFromTags(
  id: string,
  slug: string,
  title: string,
  subtitle: string,
  curator: string,
  tags: string[],
  take = 9
): PackItem {
  const matched = SAMPLE_GIFS.filter((g) => tags.includes(g.romaji)).slice(0, take);
  return {
    id,
    slug,
    title,
    subtitle,
    curator,
    gifIds: matched.map((g) => g.id),
    coverGifId: matched[0]?.id ?? SAMPLE_GIFS[0]?.id ?? "g_01"
  };
}

export const SAMPLE_PACKS: PackItem[] = [
  packFromTags("p_01", "tokyo-after-rain", "Tokyo, after rain", "Frames from a wet city.", "@kaito", [
    "neon",
    "rain",
    "tokyo",
    "cyber"
  ]),
  packFromTags("p_02", "kissaten", "kissaten", "Colors of an old café.", "@yuna", [
    "lofi",
    "ramen",
    "tea",
    "kyoto"
  ]),
  packFromTags("p_03", "monokuro", "モノクロ — Monokuro", "12 frames in black, white, and one breath", "@kazu", [
    "mono",
    "moon",
    "geometric"
  ]),
  packFromTags("p_04", "petit-bloom", "petit bloom", "Flowers, briefly.", "@yuna", [
    "sakura",
    "bloom",
    "cat"
  ]),
  packFromTags("p_05", "synth-dreams", "synth dreams", "Synth · Vapor · Pixel.", "@neuro", [
    "synthwave",
    "vaporwave",
    "pixel",
    "flame"
  ])
];

// ───────────────────────────────────────────────
//  Lookups
// ───────────────────────────────────────────────

export function findGif(slug: string): GifItem | undefined {
  return SAMPLE_GIFS.find((g) => g.slug === slug);
}

export function findPack(slug: string): PackItem | undefined {
  return SAMPLE_PACKS.find((p) => p.slug === slug);
}

export function gifsByDevice(deviceId: string): GifItem[] {
  return SAMPLE_GIFS.filter((g) => g.device === deviceId);
}
