import { NextRequest, NextResponse } from "next/server";
import {
  clearAdminSession,
  isAdminConfigured,
  setAdminSession,
  verifyAdminPassword
} from "@/lib/admin-auth";

export const runtime = "nodejs";

/** POST /api/admin/auth — body { password } → set session cookie. */
export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin not configured. Set ADMIN_PASSWORD on the server." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const pw = typeof body?.password === "string" ? body.password : "";

  // Tiny constant-time-ish delay regardless of outcome.
  await new Promise((r) => setTimeout(r, 120));

  if (!verifyAdminPassword(pw)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/auth — clear session cookie (sign out). */
export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
