"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onSignOut() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      /* ignore */
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={busy}
      className="inline-flex h-8 items-center rounded-full px-3 text-[11px] uppercase tracking-[0.1em] transition-colors"
      style={{
        background: "var(--color-bg-soft)",
        color: "var(--color-ink-muted)"
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
