// scripts/process-xpad.mjs
//
// Re-encode every xpad-mini GIF in lib/seeds.json so the on-disk file is
// 240 × 135, ≤ 200 KB, and stored locally under public/processed/.
// seeds.json is rewritten in place: gif_url and gif_small_url point at
// /processed/<slug>.gif, and width/height are clamped to the spec.
//
// Run:
//   node scripts/process-xpad.mjs              (process all)
//   node scripts/process-xpad.mjs --limit 5    (process first N for testing)
//   node scripts/process-xpad.mjs --force      (re-process even if file exists)
//
// Designed to be idempotent: re-running skips items whose output already
// exists unless --force is passed.

import { readFile, writeFile, mkdir, stat, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegStatic from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SEEDS_PATH = resolve(ROOT, "lib", "seeds.json");
const OUT_DIR = resolve(ROOT, "public", "processed");

const TARGET_W = 240;
const TARGET_H = 135;
const MAX_BYTES = 200 * 1024;

const args = process.argv.slice(2);
const limitArg = args.indexOf("--limit");
const LIMIT = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : Infinity;
const FORCE = args.includes("--force");

const FFMPEG = ffmpegStatic;
if (!FFMPEG) {
  process.stderr.write("ffmpeg-static binary not resolved\n");
  process.exit(1);
}

function exists(path) {
  return stat(path).then(
    () => true,
    () => false
  );
}

function ffmpeg(args, timeoutMs = 30_000) {
  return new Promise((resolveP, rejectP) => {
    const proc = spawn(FFMPEG, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      rejectP(new Error(`ffmpeg timeout`));
    }, timeoutMs);
    proc.on("error", (e) => {
      clearTimeout(timer);
      rejectP(e);
    });
    proc.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolveP();
      else rejectP(new Error(`ffmpeg exit ${code}: ${stderr.split("\n").slice(-5).join(" / ")}`));
    });
  });
}

/**
 * Re-encode src to 240×135 GIF with progressively more aggressive settings
 * until the output is under MAX_BYTES. Returns the chosen step's byte count.
 */
async function encodeToFit(srcPath, outPath) {
  const filterBase =
    `scale=${TARGET_W}:${TARGET_H}:force_original_aspect_ratio=increase,` +
    `crop=${TARGET_W}:${TARGET_H}`;

  // Paletted GIF tends to compress much better than naive output.
  const palettedFilter = (fps, colors) =>
    `fps=${fps},${filterBase},split[a][b];[a]palettegen=max_colors=${colors}[p];[b][p]paletteuse=dither=bayer:bayer_scale=5`;

  const steps = [
    { fps: 18, colors: 128 },
    { fps: 14, colors: 96 },
    { fps: 12, colors: 64 },
    { fps: 10, colors: 48 },
    { fps: 8, colors: 32 },
    { fps: 6, colors: 24 }
  ];

  for (const s of steps) {
    await ffmpeg([
      "-y",
      "-i",
      srcPath,
      "-vf",
      palettedFilter(s.fps, s.colors),
      "-loop",
      "0",
      outPath
    ]);
    const st = await stat(outPath);
    if (st.size <= MAX_BYTES) {
      return { bytes: st.size, fps: s.fps, colors: s.colors };
    }
  }

  // Last-ditch: 4 fps + 16 colors. Quality hit but tiny.
  await ffmpeg([
    "-y",
    "-i",
    srcPath,
    "-vf",
    palettedFilter(4, 16),
    "-loop",
    "0",
    outPath
  ]);
  const st = await stat(outPath);
  return { bytes: st.size, fps: 4, colors: 16 };
}

async function processOne(item) {
  const slug = item.slug;
  const outRel = `/processed/${slug}.gif`;
  const outAbs = resolve(OUT_DIR, `${slug}.gif`);

  if (!FORCE && (await exists(outAbs))) {
    const st = await stat(outAbs);
    return { ok: true, skipped: true, bytes: st.size, outRel };
  }

  // Download original gif_url (full size) for best post-resize quality.
  const sourceUrl = item.gif_url;
  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "miniword-processor/0.1" }
  });
  if (!res.ok) throw new Error(`fetch ${res.status} ${sourceUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const tmpIn = resolve(OUT_DIR, `${slug}.in.gif`);
  await writeFile(tmpIn, buf);

  try {
    const result = await encodeToFit(tmpIn, outAbs);
    return { ok: true, skipped: false, bytes: result.bytes, outRel };
  } finally {
    await unlink(tmpIn).catch(() => {});
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const seeds = JSON.parse(await readFile(SEEDS_PATH, "utf8"));
  const xpadItems = seeds.items.filter((it) => it.device === "xpad-mini");
  const targetItems = xpadItems.slice(0, LIMIT);

  process.stdout.write(
    `[process] ${targetItems.length} of ${xpadItems.length} xpad-mini items` +
      (FORCE ? " (force)" : " (skip existing)") +
      "\n"
  );

  let okCount = 0;
  let skipCount = 0;
  let failCount = 0;
  let totalBytes = 0;
  const failed = [];

  for (let i = 0; i < targetItems.length; i++) {
    const item = targetItems[i];
    const tag = `[${String(i + 1).padStart(3)}/${targetItems.length}] ${item.slug}`;
    try {
      const r = await processOne(item);
      if (r.skipped) {
        skipCount += 1;
        totalBytes += r.bytes;
        process.stdout.write(`${tag} skip (${kb(r.bytes)})\n`);
      } else {
        okCount += 1;
        totalBytes += r.bytes;
        process.stdout.write(`${tag} ok   (${kb(r.bytes)})\n`);
      }
      // Update item in place so partial runs still save progress.
      item.gif_url = r.outRel;
      item.gif_small_url = r.outRel;
      item.width = TARGET_W;
      item.height = TARGET_H;
    } catch (err) {
      failCount += 1;
      failed.push({ slug: item.slug, err: String(err) });
      process.stderr.write(`${tag} FAIL ${err}\n`);
    }
  }

  // Save updated seeds.json (only items in scope had their URLs changed).
  await writeFile(SEEDS_PATH, JSON.stringify(seeds, null, 2));

  process.stdout.write(
    `[process] done: ok=${okCount} skip=${skipCount} fail=${failCount} · total=${(totalBytes / 1024).toFixed(0)} KB\n`
  );
  if (failed.length) {
    process.stdout.write(`[process] failures:\n`);
    for (const f of failed) process.stdout.write(`  ${f.slug}: ${f.err}\n`);
  }
}

function kb(n) {
  return `${(n / 1024).toFixed(0)} KB`;
}

main().catch((e) => {
  process.stderr.write(`[process] fatal: ${e?.stack || e}\n`);
  process.exit(1);
});
