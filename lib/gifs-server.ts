import "server-only";
import { cache } from "react";
import { SAMPLE_GIFS, type GifItem } from "./sample-data";
import { getRemovedIds } from "./removed-server";

/**
 * SAMPLE_GIFS filtered by the admin-suppressed id set. Cached per request
 * so pages calling it multiple times only pay the Blob fetch once.
 */
export const getActiveGifs = cache(async (): Promise<GifItem[]> => {
  const removed = await getRemovedIds();
  if (removed.size === 0) return SAMPLE_GIFS;
  return SAMPLE_GIFS.filter((g) => !removed.has(g.id));
});

export async function findActiveGif(slug: string): Promise<GifItem | undefined> {
  const removed = await getRemovedIds();
  const g = SAMPLE_GIFS.find((g) => g.slug === slug);
  if (!g) return undefined;
  if (removed.has(g.id)) return undefined;
  return g;
}
