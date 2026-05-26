import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addRemovedId, clearRemovedId } from "@/lib/removed-server";

export const runtime = "nodejs";

/** Invalidate every route that reads getActiveGifs() / getRemovedIds(). */
function bustPublicCaches() {
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
  revalidatePath("/admin/library");
}

/**
 * DELETE /api/admin/crawled/[id]
 * Mark a crawled GIF as hidden from the public catalogue. Stored in a
 * tiny Vercel Blob JSON so it survives deployments and is shared across
 * server renders. Not a hard delete — the original record stays in
 * lib/seeds.json and can be restored.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await addRemovedId(id);
  bustPublicCaches();
  return NextResponse.json({ ok: true });
}

/**
 * POST /api/admin/crawled/[id]/restore — undo a soft delete.
 * (We expose this as a POST on the same path with action=restore so the
 *  table can implement a single Restore button later.)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (body?.action !== "restore") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await clearRemovedId(id);
  bustPublicCaches();
  return NextResponse.json({ ok: true });
}
