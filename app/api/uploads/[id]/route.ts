import { NextRequest, NextResponse } from "next/server";
import { del, list } from "@vercel/blob";
import { type UploadRecord, toPublic } from "@/lib/upload-types";

export const runtime = "nodejs";

/** GET /api/uploads/:id — return one public record. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const { id } = await params;
  const record = await loadRecord(id);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(toPublic(record));
}

/**
 * DELETE /api/uploads/:id — body: { pw }. Verifies pw against the stored
 * hash, then deletes both the metadata and the media blob.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const pw = String(body?.pw ?? "");

  const record = await loadRecord(id);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const probe = await sha256Hex(pw + record.pwSalt);
  if (probe !== record.pwHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 403 });
  }

  await Promise.all([del(record.blobUrl), del(metaUrlFor(id, record.blobUrl))]);

  return NextResponse.json({ ok: true });
}

async function loadRecord(id: string): Promise<UploadRecord | null> {
  const { blobs } = await list({ prefix: `uploads/${id}.json` });
  const meta = blobs[0];
  if (!meta) return null;
  try {
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as UploadRecord;
  } catch {
    return null;
  }
}

// Vercel Blob `del()` accepts a URL — the metadata blob's URL is derived
// from the same root the media URL lives on, with a known prefix.
function metaUrlFor(id: string, mediaUrl: string): string {
  const root = new URL(mediaUrl);
  root.pathname = `/uploads/${id}.json`;
  return root.toString();
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
