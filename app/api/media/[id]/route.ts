import { NextRequest, NextResponse } from "next/server";
import { list, get } from "@vercel/blob";
import type { UploadRecord } from "@/lib/upload-types";

export const runtime = "nodejs";

/**
 * GET /api/media/[id]
 * Proxies the private blob for upload id. Looks up the upload metadata,
 * fetches the underlying media blob, and streams it back with the
 * recorded Content-Type. Cached for an hour.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new NextResponse("Storage not configured", { status: 503 });
  }
  const { id } = await params;

  try {
    const meta = await loadMeta(id);
    if (!meta) return new NextResponse("Not found", { status: 404 });

    const mediaList = await list({ prefix: meta.blobPathname });
    const mediaBlob = mediaList.blobs.find((b) => b.pathname === meta.blobPathname);
    if (!mediaBlob) return new NextResponse("Media missing", { status: 404 });

    const result = await get(mediaBlob.url, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new NextResponse("Media fetch failed", { status: 502 });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type": meta.fileType || "image/gif",
        "Cache-Control": "public, max-age=3600, s-maxage=86400"
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Media fetch failed";
    return new NextResponse(msg, { status: 500 });
  }
}

async function loadMeta(id: string): Promise<UploadRecord | null> {
  const { blobs } = await list({ prefix: `uploads/${id}.json` });
  const meta = blobs.find((b) => b.pathname === `uploads/${id}.json`);
  if (!meta) return null;
  try {
    const result = await get(meta.url, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as UploadRecord;
  } catch {
    return null;
  }
}
