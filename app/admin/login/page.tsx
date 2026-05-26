"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pw })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Sign in failed" }));
        throw new Error(data.error || `Sign in failed (${res.status})`);
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[400px] rounded-[20px] p-7"
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-line-strong)"
        }}
      >
        <p className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Admin
        </p>
        <h1
          className="mt-2 text-[22px] font-semibold tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sign in to continue.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-ink-muted)]">
          Restricted area. Enter the operator password to manage uploads and
          moderation queues.
        </p>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
            Password
          </span>
          <input
            autoFocus
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="block w-full rounded-[12px] px-4 py-2.5 text-[14px] outline-none transition-colors"
            style={{
              background: "var(--color-bg-soft)",
              color: "var(--color-ink)"
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={submitting}
          />
        </label>

        {error && (
          <p
            className="mt-3 text-[12px]"
            style={{ color: "var(--color-pink-deep)" }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!pw || submitting}
          className="btn-primary mt-6 w-full"
          style={{
            opacity: !pw || submitting ? 0.5 : 1,
            cursor: !pw || submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
