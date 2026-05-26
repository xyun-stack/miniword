// scripts/randomize-authors.mjs
//
// Replace every author field in lib/seeds.json with a deterministic random
// English handle. The handle is derived from the item slug via FNV-1a so
// re-running produces the same output and the same item keeps the same name.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEEDS_PATH = resolve(__dirname, "..", "lib", "seeds.json");

const NAMES = [
  "alex","ari","arlo","ash","bjorn","cassie","cyl","dax","echo","elio",
  "ember","ezra","finn","frost","gus","haze","hugo","indi","jay","jordan",
  "june","juno","kai","kit","koa","lars","leo","lou","mavi","mila",
  "milo","mira","moss","nico","neo","noa","olan","oslo","pax","phin",
  "pixel","quill","quinn","raph","remy","rey","rio","river","ronan","sage",
  "sam","silas","skye","sora","tan","tessa","uri","vex","wren","yuki",
  "zane","loop","drift","ember","flux","glow","neon","vapor","byte","ink",
  "halo","jet","luna","nox","ozzy","peach","reef","ripple","sable","tide"
];

function fnv1a(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function nameFor(slug) {
  const h = fnv1a(slug);
  const base = NAMES[h % NAMES.length];
  const flavor = (h >>> 8) & 0b11;
  if (flavor === 0) return `@${base}`;
  if (flavor === 1) return `@${base}${(h >>> 16) % 99}`;
  if (flavor === 2) return `@${base}_${(h >>> 16) % 999}`;
  return `@${base}.${(h >>> 16) % 10}`;
}

const seeds = JSON.parse(await readFile(SEEDS_PATH, "utf8"));
let changed = 0;
for (const item of seeds.items) {
  const newAuthor = nameFor(item.slug);
  if (item.author !== newAuthor) {
    item.author = newAuthor;
    changed += 1;
  }
}
await writeFile(SEEDS_PATH, JSON.stringify(seeds, null, 2));

process.stdout.write(
  `[authors] rewrote ${changed} of ${seeds.items.length} items\n`
);
process.stdout.write(`[authors] sample:\n`);
for (const item of seeds.items.slice(0, 8)) {
  process.stdout.write(`  ${item.slug.padEnd(28)} → ${item.author}\n`);
}
