import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import {
  type UploadRecord,
  type UploadDevice,
  toPublic
} from "@/lib/upload-types";

// Force the Node runtime — @vercel/blob needs it and we use crypto.subtle
// + randomUUID which are both available in Node 20+.
export const runtime = "nodejs";

const MAX_BYTES = 200 * 1024;
const ALLOWED_MIME = /^image\/(png|jpe?g|gif)$/i;
const ALLOWED_EXT = /\.(png|jpe?g|gif)$/i;

/**
 * POST /api/uploads
 * Multipart body: file, nickname, idHandle, pw, width, height, device.
 * Stores the file in Vercel Blob and a metadata JSON alongside it.
 */
export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured (BLOB_READ_WRITE_TOKEN missing)" },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const nickname = String(form.get("nickname") ?? "").trim();
  const idHandle = String(form.get("idHandle") ?? "").trim();
  const pw = String(form.get("pw") ?? "");
  const width = parseInt(String(form.get("width") ?? "0"), 10) || 0;
  const height = parseInt(String(form.get("height") ?? "0"), 10) || 0;
  const deviceRaw = String(form.get("device") ?? "");
  const device: UploadDevice =
    deviceRaw === "xpad-mini" ? "xpad-mini" : "streamdock-15";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (nickname.length < 2 || idHandle.length < 2 || pw.length < 4) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024).toFixed(1)} KB > 200 KB)` },
      { status: 413 }
    );
  }
  const looksLikeImage =
    ALLOWED_MIME.test(file.type) || ALLOWED_EXT.test(file.name);
  if (!looksLikeImage) {
    return NextResponse.json(
      {
        error: `Unsupported format. Got "${file.type || "unknown"}" — use JPG, PNG, or GIF.`
      },
      { status: 415 }
    );
  }

  const id = crypto.randomUUID();
  const ext = (file.type.split("/")[1] ?? "gif").toLowerCase();

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const mediaBlob = await put(`media/${id}.${ext}`, buf, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false
    });

    const pwSalt = crypto.randomUUID();
    const pwHash = await sha256Hex(pw + pwSalt);

    const record: UploadRecord = {
      id,
      nickname: nickname.startsWith("@") ? nickname : `@${nickname}`,
      idHandle,
      pwHash,
      pwSalt,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      width: width || 240,
      height: height || 135,
      device,
      blobUrl: mediaBlob.url,
      createdAt: Date.now()
    };

    await put(`uploads/${id}.json`, JSON.stringify(record), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false
    });

    return NextResponse.json(toPublic(record), { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Storage write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET /api/uploads
 * Query params: idHandle, q, device. Returns matching public records,
 * newest first.
 */
export async function GET(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ items: [] });
  }

  const url = new URL(req.url);
  const filterHandle = url.searchParams.get("idHandle")?.trim() || null;
  const q = (url.searchParams.get("q") || "").trim().toLowerCase().replace(/^@/, "");
  const filterDevice = url.searchParams.get("device") || null;

  const { blobs } = await list({ prefix: "uploads/" });
  const records: UploadRecord[] = (
    await Promise.all(
      blobs.map(async (b) => {
        try {
          const res = await fetch(b.url, { cache: "no-store" });
          if (!res.ok) return null;
          return (await res.json()) as UploadRecord;
        } catch {
          return null;
        }
      })
    )
  ).filter((x): x is UploadRecord => Boolean(x?.id));

  let filtered = records;
  if (filterHandle) {
    filtered = filtered.filter((r) => r.idHandle === filterHandle);
  }
  if (filterDevice && filterDevice !== "all") {
    filtered = filtered.filter((r) => r.device === filterDevice);
  }
  if (q) {
    filtered = filtered.filter((r) =>
      `${r.nickname} ${r.idHandle} ${r.fileName}`.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ items: filtered.map(toPublic) });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
