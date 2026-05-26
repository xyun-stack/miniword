#!/usr/bin/env node
/**
 * dedupe-visual.mjs
 *
 * Decode each GIF's first frame to a 16x16 grayscale raster (256 bytes,
 * deterministic via ffmpeg `area` scaler). Two GIFs are treated as
 * visual duplicates when their per-pixel L1 distance averages below
 * THRESHOLD, which catches the same animation re-encoded into a
 * different file (slightly different bytes, visually identical frame).
 * Per cluster, keep the lowest-rank (most popular) item.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEEDS_PATH = path.join(__dirname, "..", "lib", "seeds.json");
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const SIZE = 16;
const N_PIX = SIZE * SIZE;
// Per-pixel match: |a[i]-b[i]| ≤ PIXEL_TOL is "close enough" to count as
// a matching pixel. If >= MIN_MATCH_RATIO of pixels match, the two
// thumbnails count as the same image and one is dropped.
const PIXEL_TOL = 8;             // ~3% of the 0–255 grayscale range — sharp match
const MIN_MATCH_RATIO = 0.5;     // user spec: ≥ 50% of pixels alike
const CONCURRENCY = 12;
const FETCH_TIMEOUT_MS = 25_000;

async function fetchBuffer(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(t);
  }
}

function firstFrameRaw(inputBuf) {
  return new Promise((resolve, reject) => {
    const args = [
      "-hide_banner", "-loglevel", "error",
      "-i", "pipe:0",
      "-vf", `select=eq(n\\,0),scale=${SIZE}:${SIZE}:flags=area,format=gray`,
      "-frames:v", "1",
      "-f", "rawvideo", "-pix_fmt", "gray", "pipe:1"
    ];
    const child = spawn(ffmpegPath, args, { stdio: ["pipe", "pipe", "pipe"] });
    const chunks = [];
    let stderr = "";
    child.stdout.on("data", (c) => chunks.push(c));
    child.stderr.on("data", (c) => (stderr += c.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(0, 200)}`));
      }
      const buf = Buffer.concat(chunks);
      if (buf.length < N_PIX) return reject(new Error(`short frame: ${buf.length}`));
      resolve(buf.subarray(0, N_PIX));
    });
    child.stdin.on("error", () => {});
    child.stdin.end(inputBuf);
  });
}

async function loadFirstFrame(item) {
  try {
    const buf = item.gif_url?.startsWith("/")
      ? await fs.promises.readFile(path.join(PUBLIC_DIR, item.gif_url.replace(/^\//, "")))
      : await fetchBuffer(item.gif_url, FETCH_TIMEOUT_MS);
    const raw = await firstFrameRaw(buf);
    return { id: item.id, frame: new Uint8Array(raw) };
  } catch (err) {
    return { id: item.id, frame: null, error: String(err.message || err) };
  }
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  let done = 0;
  const tick = () => {
    if (done % 25 === 0 || done === items.length) {
      process.stderr.write(`\rhashing ${done}/${items.length}`);
    }
  };
  async function take() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
      done++;
      tick();
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, take));
  process.stderr.write("\n");
  return results;
}

class DSU {
  constructor(n) {
    this.p = Array.from({ length: n }, (_, i) => i);
    this.r = new Array(n).fill(0);
  }
  find(x) {
    while (this.p[x] !== x) {
      this.p[x] = this.p[this.p[x]];
      x = this.p[x];
    }
    return x;
  }
  union(a, b) {
    a = this.find(a); b = this.find(b);
    if (a === b) return;
    if (this.r[a] < this.r[b]) [a, b] = [b, a];
    this.p[b] = a;
    if (this.r[a] === this.r[b]) this.r[a]++;
  }
}

function matchRatio(a, b) {
  let m = 0;
  for (let i = 0; i < N_PIX; i++) {
    if (Math.abs(a[i] - b[i]) <= PIXEL_TOL) m++;
  }
  return m / N_PIX;
}

async function main() {
  const seeds = JSON.parse(fs.readFileSync(SEEDS_PATH, "utf8"));
  const items = seeds.items;
  console.log(`loaded ${items.length} items`);

  const hashed = await runPool(items, loadFirstFrame);
  const errors = hashed.filter((h) => !h.frame);
  console.log(`first frames ok: ${hashed.length - errors.length}, errors: ${errors.length}`);
  for (const f of errors.slice(0, 8)) console.log(`  err ${f.id}: ${f.error}`);

  const n = items.length;

  // Greedy dedupe ordered by rank. Walk most-popular → least-popular; for
  // each surviving item, scan the remaining items and drop the ones whose
  // thumbnail matches ≥ MIN_MATCH_RATIO. This avoids the transitive
  // closure that DSU produces (where A~B and B~C ends up dragging A and
  // C into the same cluster even when they don't look alike).
  const order = Array.from({ length: n }, (_, i) => i)
    .sort((a, b) => (items[a].rank ?? 9999) - (items[b].rank ?? 9999));

  const droppedBy = new Map();   // idx of dropped item → idx of keeper
  let comparisons = 0;

  for (let oi = 0; oi < order.length; oi++) {
    const keeper = order[oi];
    if (droppedBy.has(keeper)) continue;
    const ak = hashed[keeper];
    if (!ak.frame) continue;
    for (let oj = oi + 1; oj < order.length; oj++) {
      const cand = order[oj];
      if (droppedBy.has(cand)) continue;
      const bc = hashed[cand];
      if (!bc.frame) continue;
      comparisons++;
      if (matchRatio(ak.frame, bc.frame) >= MIN_MATCH_RATIO) {
        droppedBy.set(cand, keeper);
      }
    }
  }
  console.log(`pairs compared: ${comparisons}`);

  // Group drops under their keeper for reporting.
  const groupsByKeeper = new Map();
  for (let i = 0; i < n; i++) groupsByKeeper.set(i, []);
  for (const [drop, keeper] of droppedBy) {
    groupsByKeeper.get(keeper).push(drop);
  }

  const keepIdx = new Set();
  for (let i = 0; i < n; i++) if (!droppedBy.has(i)) keepIdx.add(i);

  let multiCount = 0;
  let largestCluster = 1;
  const examples = [];
  let totalDropped = droppedBy.size;
  for (const [keeper, drops] of groupsByKeeper) {
    if (drops.length === 0) continue;
    multiCount++;
    const size = drops.length + 1;
    if (size > largestCluster) largestCluster = size;
    if (examples.length < 12) {
      examples.push({
        keep: `${items[keeper].id} ${items[keeper].slug}`,
        drop: drops.map((i) => `${items[i].id} ${items[i].slug}`)
      });
    }
  }

  console.log(`dup clusters (size>1): ${multiCount}, largest: ${largestCluster}`);
  console.log(`will drop: ${totalDropped}, will keep: ${keepIdx.size}`);
  console.log("examples:");
  for (const ex of examples) {
    console.log("  keep:", ex.keep);
    for (const d of ex.drop) console.log("    drop:", d);
  }

  const kept = [];
  for (let i = 0; i < n; i++) if (keepIdx.has(i)) kept.push(items[i]);

  const dt = { "xpad-mini": 0, "streamdock-15": 0 };
  for (const it of kept) dt[it.device] = (dt[it.device] || 0) + 1;

  const out = {
    ...seeds,
    generated_at: new Date().toISOString(),
    count: kept.length,
    device_tally: dt,
    source_tally: { ...seeds.source_tally, tenor: kept.length },
    items: kept
  };
  fs.writeFileSync(SEEDS_PATH, JSON.stringify(out, null, 2));
  console.log(`wrote ${kept.length} items to seeds.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
