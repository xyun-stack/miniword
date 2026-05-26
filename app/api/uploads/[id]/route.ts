import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del, list, get } from "@vercel/blob";
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

  const metaUrl = await metaUrlFor(id);
  const { blobs: mediaList } = await list({ prefix: record.blobPathname });
  const mediaUrl = mediaList.find((b) => b.pathname === record.blobPathname)?.url;

  await Promise.all([
    mediaUrl ? del(mediaUrl) : Promise.resolve(),
    metaUrl ? del(metaUrl) : Promise.resolve()
  ]);

  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/uploaded");
  revalidatePath("/admin");
  revalidatePath("/admin/uploads");

  return NextResponse.json({ ok: true });
}

async function loadRecord(id: string): Promise<UploadRecord | null> {
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

async function metaUrlFor(id: string): Promise<string | null> {
  const { blobs } = await list({ prefix: `uploads/${id}.json` });
  return blobs.find((b) => b.pathname === `uploads/${id}.json`)?.url ?? null;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
