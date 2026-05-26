// scripts/english-titles.mjs
//
// Rewrite every title in lib/seeds.json to its English label, derived
// from the romaji tag. Deterministic and idempotent — re-running with
// the same seeds.json produces the same output.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEEDS_PATH = resolve(__dirname, "..", "lib", "seeds.json");

const TITLES = {
  lofi: "Lofi",
  cyberpunk: "Cyberpunk",
  neon: "Neon",
  evangelion: "Evangelion",
  akira: "Akira",
  bebop: "Cowboy Bebop",
  ghost: "Ghost in the Shell",
  ghibli: "Ghibli",
  mononoke: "Mononoke",
  spirited: "Spirited Away",
  yourname: "Your Name",
  tokyo: "Tokyo",
  shibuya: "Shibuya",
  rain: "Rain",
  sakura: "Sakura",
  lain: "Lain",
  trigun: "Trigun",
  magicalgirl: "Magical Girl",
  mecha: "Mecha",
  vaporwave: "Vaporwave",
  filmanime: "Film Anime",
  ova: "OVA",
  celanime: "Cel Anime",
  opening: "Opening",
  retroanime: "Retro Anime",
  gundam: "Gundam",
  jojo: "JoJo",
  pixel: "Pixel",
  pokemon: "Pokémon",
  mario: "Mario",
  sonic: "Sonic",
  nintendo: "Nintendo",
  arcade: "Arcade",
  eightbit: "8-bit",
  jrpg: "JRPG",
  visualnovel: "Visual Novel",
  fighter: "Fighter",
  gacha: "Gacha",
  rhythm: "Rhythm",
  synthwave: "Synthwave",
  glitch: "Glitch",
  mono: "Mono",
  sign: "Sign",
  miku: "Miku",
  vocaloid: "Vocaloid",
  chibi: "Chibi",
  kawaii: "Kawaii",
  vtuber: "VTuber",
  cat: "Cat",
  ramen: "Ramen"
};

const seeds = JSON.parse(await readFile(SEEDS_PATH, "utf8"));
const counts = new Map();
let changed = 0;
let unknown = 0;

for (const item of seeds.items) {
  const tag = item.romaji;
  const next = TITLES[tag];
  if (!next) {
    unknown += 1;
    continue;
  }
  if (item.title !== next) {
    item.title = next;
    changed += 1;
  }
  counts.set(tag, (counts.get(tag) ?? 0) + 1);
}

await writeFile(SEEDS_PATH, JSON.stringify(seeds, null, 2));

process.stdout.write(
  `[titles] rewrote ${changed} of ${seeds.items.length}` +
    (unknown ? ` · ${unknown} skipped (unknown tag)` : "") +
    "\n"
);
process.stdout.write(`[titles] coverage by tag:\n`);
for (const [tag, n] of [...counts.entries()].sort()) {
  process.stdout.write(`  ${tag.padEnd(14)} ${TITLES[tag].padEnd(22)} ${n}\n`);
}
