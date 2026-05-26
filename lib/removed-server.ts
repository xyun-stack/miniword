import "server-only";
import { cache } from "react";
import { list, get, put } from "@vercel/blob";

const REMOVED_PATH = "admin/removed.json";

/**
 * Cached per-request read of the admin-suppressed GIF id set. Stored as
 * a tiny JSON array in Vercel Blob so it persists across deployments
 * and is shared by every server render.
 *
 * React.cache() dedupes within a single request so the same render tree
 * pays the Blob fetch only once.
 */
export const getRemovedIds = cache(async (): Promise<Set<string>> => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return new Set();
  try {
    const { blobs } = await list({ prefix: REMOVED_PATH });
    const meta = blobs.find((b) => b.pathname === REMOVED_PATH);
    if (!meta) return new Set();
    const result = await get(meta.url, { access: "private" });
    if (!result || result.statusCode !== 200) return new Set();
    const text = await new Response(result.stream).text();
    const arr = JSON.parse(text) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
});

export async function addRemovedId(id: string): Promise<void> {
  const current = await readRaw();
  if (current.has(id)) return;
  current.add(id);
  await writeRaw(current);
}

export async function clearRemovedId(id: string): Promise<void> {
  const current = await readRaw();
  if (!current.has(id)) return;
  current.delete(id);
  await writeRaw(current);
}

/** Read without the per-request cache (used by writers). */
async function readRaw(): Promise<Set<string>> {
  try {
    const { blobs } = await list({ prefix: REMOVED_PATH });
    const meta = blobs.find((b) => b.pathname === REMOVED_PATH);
    if (!meta) return new Set();
    const result = await get(meta.url, { access: "private" });
    if (!result || result.statusCode !== 200) return new Set();
    const text = await new Response(result.stream).text();
    const arr = JSON.parse(text) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

async function writeRaw(ids: Set<string>): Promise<void> {
  await put(REMOVED_PATH, JSON.stringify(Array.from(ids)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false
  });
}
