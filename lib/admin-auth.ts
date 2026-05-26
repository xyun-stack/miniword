import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

export const ADMIN_COOKIE = "miniworld.admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SESSION_SECRET = "miniworld-admin-session";

function adminPassword(): string | null {
  const v = process.env.ADMIN_PASSWORD;
  return v && v.length > 0 ? v : null;
}

function signSession(): string | null {
  const pw = adminPassword();
  if (!pw) return null;
  return crypto.createHmac("sha256", pw).update(SESSION_SECRET).digest("hex");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

/** Verify the supplied password matches ADMIN_PASSWORD (constant time). */
export function verifyAdminPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  return timingSafeStringEqual(input, expected);
}

/** True when the current request's cookie carries a valid admin session. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = signSession();
  if (!expected) return false;
  const store = await cookies();
  const got = store.get(ADMIN_COOKIE)?.value;
  if (!got) return false;
  return timingSafeStringEqual(got, expected);
}

/** Set the admin session cookie. Caller must have verified the password first. */
export async function setAdminSession(): Promise<void> {
  const value = signSession();
  if (!value) return;
  const store = await cookies();
  store.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/** True when ADMIN_PASSWORD is configured. UI may use this to surface help. */
export function isAdminConfigured(): boolean {
  return adminPassword() !== null;
}
