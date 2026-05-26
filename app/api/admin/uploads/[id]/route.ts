import { NextRequest, NextResponse } from "next/server";
import { del, list, get } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { UploadRecord } from "@/lib/upload-types";

export const runtime = "nodejs";

/**
 * DELETE /api/admin/uploads/:id — admin-only, no password required.
 * Removes both the metadata JSON blob and the media blob.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const { id } = await params;

  // Load metadata to find the underlying media blob pathname.
  const metaPath = `uploads/${id}.json`;
  const { blobs } = await list({ prefix: metaPath });
  const meta = blobs.find((b) => b.pathname === metaPath);
  if (!meta) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let record: UploadRecord | null = null;
  try {
    const result = await get(meta.url, { access: "private" });
    if (result && result.statusCode === 200) {
      const text = await new Response(result.stream).text();
      record = JSON.parse(text) as UploadRecord;
    }
  } catch {
    /* fall through */
  }

  let mediaUrl: string | null = null;
  if (record?.blobPathname) {
    const { blobs: mediaBlobs } = await list({ prefix: record.blobPathname });
    mediaUrl =
      mediaBlobs.find((b) => b.pathname === record!.blobPathname)?.url ?? null;
  }

  await Promise.all([
    mediaUrl ? del(mediaUrl) : Promise.resolve(),
    del(meta.url)
  ]);

  return NextResponse.json({ ok: true });
}
