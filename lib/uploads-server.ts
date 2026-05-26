import "server-only";
import { list, get } from "@vercel/blob";
import {
  type PublicUpload,
  type UploadRecord,
  toPublic
} from "./upload-types";

/**
 * Server-side helper for listing uploads stored in the private Vercel Blob
 * store. Mirrors the filter logic in /api/uploads so callers (e.g. the
 * /browse server component) can include uploads in their result set
 * without round-tripping through our own API.
 */
export async function listUploadsServer(filters: {
  device?: string | null;
  q?: string | null;
}): Promise<PublicUpload[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  try {
    const { blobs } = await list({ prefix: "uploads/" });
    const records = (
      await Promise.all(
        blobs.map(async (b) => {
          try {
            const r = await get(b.url, { access: "private" });
            if (!r || r.statusCode !== 200) return null;
            const text = await new Response(r.stream).text();
            return JSON.parse(text) as UploadRecord;
          } catch {
            return null;
          }
        })
      )
    ).filter((x): x is UploadRecord => Boolean(x?.id));

    let filtered = records;
    const needle = (filters.q ?? "").trim().toLowerCase().replace(/^@/, "");

    if (filters.device && filters.device !== "all") {
      filtered = filtered.filter((r) => r.device === filters.device);
    }
    if (needle) {
      filtered = filtered.filter((r) =>
        `${r.nickname} ${r.idHandle} ${r.fileName}`.toLowerCase().includes(needle)
      );
    }

    filtered.sort((a, b) => b.createdAt - a.createdAt);
    return filtered.map(toPublic);
  } catch {
    return [];
  }
}
