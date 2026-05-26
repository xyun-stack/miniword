// scripts/crawl.mjs
//
// Pulls a curated set of GIFs from public GIF search APIs (Tenor v1 → Giphy)
// and writes the result to lib/seeds.json.
//
// Device is assigned per item based on the GIF's actual aspect ratio so that
// every tag has a mix of landscape (xpad-mini) and square (streamdock-15)
// items — no tag ends up empty for one device.

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "lib", "seeds.json");

const TENOR_KEY = process.env.TENOR_API_KEY || "LIVDSRZULELA";
const GIPHY_KEY = process.env.GIPHY_API_KEY || "dc6zaTOxFJmzC";

const QUERIES = [
  // Anime (films, scenes, franchises, eras)
  { tag: "lofi",        q: "lofi anime girl",             mood: "warm", motion: "subtle", titleKo: "로파이" },
  { tag: "cyberpunk",   q: "cyberpunk anime",             mood: "loud", motion: "medium", titleKo: "사이버펑크" },
  { tag: "neon",        q: "neon city anime",             mood: "loud", motion: "medium", titleKo: "네온" },
  { tag: "evangelion",  q: "neon genesis evangelion",     mood: "loud", motion: "active", titleKo: "에반게리온" },
  { tag: "akira",       q: "akira anime motorcycle",      mood: "loud", motion: "active", titleKo: "아키라" },
  { tag: "bebop",       q: "cowboy bebop",                mood: "cool", motion: "medium", titleKo: "카우보이비밥" },
  { tag: "ghost",       q: "ghost in the shell",          mood: "cool", motion: "medium", titleKo: "공각기동대" },
  { tag: "ghibli",      q: "studio ghibli",               mood: "calm", motion: "subtle", titleKo: "지브리" },
  { tag: "mononoke",    q: "princess mononoke",           mood: "calm", motion: "subtle", titleKo: "모노노케" },
  { tag: "spirited",    q: "spirited away",               mood: "calm", motion: "subtle", titleKo: "센과치히로" },
  { tag: "yourname",    q: "your name kimi no nawa",      mood: "warm", motion: "subtle", titleKo: "너의이름은" },
  { tag: "tokyo",       q: "tokyo anime",                 mood: "cool", motion: "medium", titleKo: "도쿄" },
  { tag: "shibuya",     q: "shibuya anime",               mood: "loud", motion: "medium", titleKo: "시부야" },
  { tag: "rain",        q: "anime rainy",                 mood: "cool", motion: "subtle", titleKo: "비창" },
  { tag: "sakura",      q: "sakura anime",                mood: "warm", motion: "subtle", titleKo: "사쿠라" },
  { tag: "lain",        q: "serial experiments lain",     mood: "mono", motion: "subtle", titleKo: "라인" },
  { tag: "trigun",      q: "trigun anime",                mood: "warm", motion: "active", titleKo: "트라이건" },
  { tag: "magicalgirl", q: "magical girl anime",          mood: "loud", motion: "active", titleKo: "마법소녀" },
  { tag: "mecha",       q: "mecha anime",                 mood: "loud", motion: "active", titleKo: "메카" },
  { tag: "vaporwave",   q: "vaporwave aesthetic",         mood: "loud", motion: "medium", titleKo: "베이퍼웨이브" },
  { tag: "filmanime",   q: "anime film cinematic",        mood: "cool", motion: "subtle", titleKo: "필름애니메" },
  { tag: "ova",         q: "anime ova 90s",               mood: "warm", motion: "medium", titleKo: "OVA" },
  { tag: "celanime",    q: "cel animation anime",         mood: "warm", motion: "medium", titleKo: "셀애니메" },
  { tag: "opening",     q: "anime opening",               mood: "loud", motion: "active", titleKo: "오프닝" },
  { tag: "retroanime",  q: "retro anime 80s",             mood: "warm", motion: "medium", titleKo: "레트로애니메" },
  { tag: "gundam",      q: "gundam mecha",                mood: "loud", motion: "active", titleKo: "건담" },
  { tag: "jojo",        q: "jojo bizarre adventure",      mood: "loud", motion: "active", titleKo: "죠죠" },

  // Game
  { tag: "pixel",       q: "pixel art anime",             mood: "cool", motion: "active", titleKo: "픽셀" },
  { tag: "pokemon",     q: "pokemon pixel",               mood: "warm", motion: "active", titleKo: "포켓몬" },
  { tag: "mario",       q: "mario pixel",                 mood: "loud", motion: "active", titleKo: "마리오" },
  { tag: "sonic",       q: "sonic pixel",                 mood: "loud", motion: "active", titleKo: "소닉" },
  { tag: "nintendo",    q: "nintendo retro",              mood: "warm", motion: "active", titleKo: "닌텐도" },
  { tag: "arcade",      q: "retro arcade game",           mood: "loud", motion: "active", titleKo: "아케이드" },
  { tag: "eightbit",    q: "8 bit pixel loop",            mood: "cool", motion: "active", titleKo: "8비트" },
  { tag: "jrpg",        q: "jrpg pixel sprite",           mood: "warm", motion: "active", titleKo: "JRPG" },
  { tag: "visualnovel", q: "visual novel anime",          mood: "calm", motion: "medium", titleKo: "비주얼노벨" },
  { tag: "fighter",     q: "anime fighting game",         mood: "loud", motion: "active", titleKo: "격투게임" },
  { tag: "gacha",       q: "gacha game anime",            mood: "loud", motion: "medium", titleKo: "가챠" },
  { tag: "rhythm",      q: "anime rhythm game",           mood: "loud", motion: "active", titleKo: "리듬게임" },

  // Aesthetic
  { tag: "synthwave",   q: "synthwave grid",              mood: "loud", motion: "medium", titleKo: "신스웨이브" },
  { tag: "glitch",      q: "anime glitch art",            mood: "loud", motion: "active", titleKo: "글리치" },
  { tag: "mono",        q: "anime monochrome",            mood: "mono", motion: "subtle", titleKo: "모노" },
  { tag: "sign",        q: "anime neon sign",             mood: "loud", motion: "medium", titleKo: "사인" },

  // Character
  { tag: "miku",        q: "hatsune miku",                mood: "loud", motion: "active", titleKo: "미쿠" },
  { tag: "vocaloid",    q: "vocaloid pixel",              mood: "cool", motion: "medium", titleKo: "보컬로이드" },
  { tag: "chibi",       q: "chibi anime",                 mood: "warm", motion: "medium", titleKo: "치비" },
  { tag: "kawaii",      q: "kawaii emote",                mood: "warm", motion: "medium", titleKo: "카와이" },
  { tag: "vtuber",      q: "vtuber emote",                mood: "warm", motion: "medium", titleKo: "버튜버" },
  { tag: "cat",         q: "anime cat",                   mood: "warm", motion: "medium", titleKo: "고양이" },
  { tag: "ramen",       q: "ramen anime",                 mood: "warm", motion: "subtle", titleKo: "라멘" }
];

const PER_QUERY = 22;

/**
 * Pick device by actual aspect ratio so each tag gets a natural mix:
 *   landscape  (aspect > 1.4)  → xpad-mini
 *   else                       → streamdock-15
 */
function classifyDevice(w, h) {
  if (!w || !h) return "streamdock-15";
  const aspect = w / h;
  return aspect > 1.4 ? "xpad-mini" : "streamdock-15";
}

async function fromTenor(query, want) {
  const overfetch = 50;
  const collected = [];
  let pos = "";
  let safety = 0;

  while (collected.length < want * 3 && safety < 5) {
    safety += 1;
    const url =
      `https://g.tenor.com/v1/search?key=${TENOR_KEY}` +
      `&q=${encodeURIComponent(query.q)}` +
      `&limit=${overfetch}` +
      (pos ? `&pos=${encodeURIComponent(pos)}` : "") +
      `&contentfilter=high` +
      `&media_filter=minimal`;

    const res = await fetch(url, { headers: { "User-Agent": "miniword-crawler/0.1" } });
    if (!res.ok) {
      process.stderr.write(`[tenor] ${res.status} for "${query.q}"\n`);
      break;
    }
    const json = await res.json();
    const raw = Array.isArray(json.results) ? json.results : [];
    if (!raw.length) break;

    for (const it of raw) {
      const bucket = (it.media || [])[0] || {};
      const gif = bucket.gif || bucket.mediumgif || bucket.tinygif;
      const tiny = bucket.tinygif || bucket.nanogif || gif;
      const still = bucket.gifpreview || bucket.tinygifpreview || null;
      if (!gif?.url) continue;
      const [w, h] = gif.dims || [0, 0];
      collected.push({
        id: it.id,
        title: it.content_description || it.title || query.titleKo,
        author: it.username ? `@${it.username}` : "@tenor",
        source: it.itemurl || `https://tenor.com/view/${it.id}`,
        w,
        h,
        gif_url: gif.url,
        gif_small_url: tiny?.url || gif.url,
        poster_url: still?.url || null,
        license: "tenor"
      });
    }

    if (!json.next || json.next === pos) break;
    pos = json.next;
  }

  return collected;
}

async function fromGiphy(query, want) {
  const url =
    `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}` +
    `&q=${encodeURIComponent(query.q)}` +
    `&limit=${Math.min(50, want * 2)}` +
    `&rating=g`;
  const res = await fetch(url);
  if (!res.ok) {
    process.stderr.write(`[giphy] ${res.status} for "${query.q}"\n`);
    return null;
  }
  const json = await res.json();
  const raw = Array.isArray(json.data) ? json.data : [];
  return raw
    .map((item) => {
      const fixed = item.images?.fixed_height;
      if (!fixed?.url) return null;
      return {
        id: item.id,
        title: item.title?.trim() || query.titleKo,
        author: item.username ? `@${item.username}` : "@giphy",
        source: item.url,
        w: parseInt(fixed.width, 10),
        h: parseInt(fixed.height, 10),
        gif_url: fixed.url,
        gif_small_url: item.images?.fixed_height_small?.url || fixed.url,
        poster_url: item.images?.fixed_height_still?.url || null,
        license: "giphy"
      };
    })
    .filter(Boolean);
}

/**
 * Keep up to N items per query, interleaving devices so that the final
 * sequence has both landscape and square items distributed evenly.
 *
 * If one device has many more candidates than the other, we still keep
 * up to ceil(N/2) of each. Tail is filled from the larger pool.
 */
function balanceByDevice(items, n) {
  const landscape = [];
  const square = [];
  for (const it of items) {
    if (!it.w || !it.h) continue;
    if (it.w / it.h > 1.4) landscape.push(it);
    else square.push(it);
  }
  const halfA = Math.ceil(n / 2);
  const halfB = Math.floor(n / 2);
  const out = [];
  // Interleave
  for (let i = 0; i < Math.max(halfA, halfB); i++) {
    if (i < halfA && landscape[i]) out.push(landscape[i]);
    if (i < halfB && square[i]) out.push(square[i]);
  }
  // Top up from whichever pool still has items
  if (out.length < n) {
    const used = new Set(out.map((x) => x.id));
    const tail = [...landscape, ...square].filter((x) => !used.has(x.id));
    for (const x of tail) {
      if (out.length >= n) break;
      out.push(x);
    }
  }
  return out.slice(0, n);
}

async function fetchForQuery(query) {
  const tenor = await fromTenor(query, PER_QUERY);
  if (tenor && tenor.length) {
    return { source: "tenor", items: balanceByDevice(tenor, PER_QUERY) };
  }
  const giphy = await fromGiphy(query, PER_QUERY);
  if (giphy && giphy.length) {
    return { source: "giphy", items: balanceByDevice(giphy, PER_QUERY) };
  }
  return { source: "none", items: [] };
}

async function main() {
  process.stdout.write(
    `[crawl] ${QUERIES.length} queries × ${PER_QUERY} items · tenor=${TENOR_KEY.slice(0, 4)}… giphy=${GIPHY_KEY.slice(0, 4)}…\n`
  );

  const items = [];
  let index = 0;
  const sourceTally = { tenor: 0, giphy: 0, none: 0 };
  const deviceTally = { "xpad-mini": 0, "streamdock-15": 0 };

  for (const q of QUERIES) {
    const { source, items: batch } = await fetchForQuery(q);
    sourceTally[source] += batch.length || 0;
    let queryRank = 0;
    let perDeviceCount = { "xpad-mini": 0, "streamdock-15": 0 };
    for (const r of batch) {
      queryRank += 1;
      const seq = String(++index).padStart(4, "0");
      const device = classifyDevice(r.w, r.h);
      perDeviceCount[device] += 1;
      deviceTally[device] += 1;
      items.push({
        id: `g_${seq}`,
        slug: `${q.tag}-${r.id.toString().slice(0, 8)}`.toLowerCase(),
        title: q.titleKo,
        romaji: q.tag,
        author: r.author,
        device,
        mood: q.mood,
        motion: q.motion,
        rank: queryRank,
        gif_url: r.gif_url,
        gif_small_url: r.gif_small_url,
        poster_url: r.poster_url,
        source_url: r.source,
        width: r.w,
        height: r.h,
        license: r.license
      });
    }
    process.stdout.write(
      `[crawl] ${q.tag.padEnd(12)} ${source.padEnd(6)} ` +
      `total=${String(batch.length).padStart(2)} ` +
      `xpad=${String(perDeviceCount["xpad-mini"]).padStart(2)} ` +
      `sd=${String(perDeviceCount["streamdock-15"]).padStart(2)}\n`
    );
  }

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(
    OUT_PATH,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        source_tally: sourceTally,
        device_tally: deviceTally,
        count: items.length,
        items
      },
      null,
      2
    ),
    "utf8"
  );
  process.stdout.write(
    `[crawl] wrote ${items.length} · xpad=${deviceTally["xpad-mini"]} sd=${deviceTally["streamdock-15"]}\n`
  );
}

main().catch((err) => {
  process.stderr.write(`[crawl] fatal: ${err?.stack || err}\n`);
  process.exit(1);
});
