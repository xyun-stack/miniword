"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type LibraryRow = {
  id: string;
  slug: string;
  title: string;
  romaji: string;
  author: string;
  device: string;
  mood: string;
  motion: string;
  rank: number;
  gif_small_url: string;
  suppressed: boolean;
};

type Props = {
  rows: LibraryRow[];
};

const PAGE_SIZE = 60;

export function AdminLibraryTable({ rows }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSuppressedOnly, setShowSuppressedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#|@/, "");
    return rows.filter((r) => {
      if (showSuppressedOnly && !r.suppressed) return false;
      if (!q) return true;
      const hay = `${r.title} ${r.romaji} ${r.author} ${r.device} ${r.mood} ${r.motion} ${r.id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, showSuppressedOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const view = filtered.slice(start, start + PAGE_SIZE);

  async function remove(id: string) {
    if (pendingId) return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crawled/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setPendingId(null);
    }
  }

  async function restore(id: string) {
    if (pendingId) return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/crawled/${id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "restore" })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Filter by title, tag, author, device, mood, motion, id…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="block w-full max-w-md rounded-[12px] px-4 py-2 text-[13px] outline-none transition-colors"
          style={{
            background: "var(--color-bg-soft)",
            color: "var(--color-ink)"
          }}
        />
        <label className="inline-flex items-center gap-2 text-[12px] text-[color:var(--color-ink-muted)]">
          <input
            type="checkbox"
            checked={showSuppressedOnly}
            onChange={(e) => {
              setShowSuppressedOnly(e.target.checked);
              setPage(1);
            }}
            className="h-3.5 w-3.5"
          />
          Only suppressed
        </label>
        <span className="text-[12px] text-[color:var(--color-ink-muted)] tabular-nums">
          {filtered.length} / {rows.length}
        </span>
      </div>

      {error && (
        <p className="text-[12px]" style={{ color: "var(--color-pink-deep)" }}>
          {error}
        </p>
      )}

      <div
        className="overflow-hidden rounded-[14px]"
        style={{ border: "1px solid var(--color-line-strong)" }}
      >
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr
              className="text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]"
              style={{ background: "var(--color-bg-soft)" }}
            >
              <Th>Preview</Th>
              <Th>Title / Tag</Th>
              <Th>Meta</Th>
              <Th align="right">Rank</Th>
              <Th align="right">Status</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr
                key={r.id}
                className="align-middle transition-colors hover:bg-[color:var(--color-bg-soft)]"
                style={{
                  borderTop: "1px solid var(--color-line)",
                  opacity: r.suppressed ? 0.55 : 1
                }}
              >
                <td className="px-3 py-2">
                  <a
                    href={`/gif/${r.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-12 w-20 overflow-hidden rounded-md"
                    style={{ background: "var(--color-bg-soft)" }}
                  >
                    <img
                      src={r.gif_small_url}
                      alt={r.title}
                      className="h-full w-full object-cover"
                    />
                  </a>
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-[11px] text-[color:var(--color-ink-muted)]">
                    #{r.romaji} · {r.author}
                  </div>
                </td>
                <td className="px-3 py-2 text-[11px] text-[color:var(--color-ink-muted)]">
                  {r.device} · {r.mood} · {r.motion}
                </td>
                <td className="px-3 py-2 text-right text-[12px] tabular-nums">
                  {r.rank}
                </td>
                <td className="px-3 py-2 text-right text-[11px] uppercase tracking-[0.06em]">
                  {r.suppressed ? (
                    <span style={{ color: "var(--color-pink-deep)" }}>
                      Hidden
                    </span>
                  ) : (
                    <span className="text-[color:var(--color-ink-muted)]">
                      Public
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.suppressed ? (
                    <button
                      type="button"
                      onClick={() => restore(r.id)}
                      disabled={pendingId === r.id}
                      className="inline-flex h-8 items-center rounded-full px-3 text-[11px] uppercase tracking-[0.06em] transition-colors disabled:opacity-50"
                      style={{
                        background: "var(--color-bg-soft)",
                        color: "var(--color-ink)"
                      }}
                    >
                      {pendingId === r.id ? "Restoring…" : "Restore"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      disabled={pendingId === r.id}
                      className="inline-flex h-8 items-center rounded-full px-3 text-[11px] uppercase tracking-[0.06em] transition-colors disabled:opacity-50"
                      style={{
                        background: "var(--color-pink)",
                        color: "var(--color-ink)"
                      }}
                    >
                      {pendingId === r.id ? "Removing…" : "Remove"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-[13px] text-[color:var(--color-ink-muted)]"
                >
                  Nothing matches that query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="pill disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-[12px] tabular-nums text-[color:var(--color-ink-muted)]">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="pill disabled:opacity-40"
          >
            →
          </button>
        </nav>
      )}
    </div>
  );
}

function Th({
  children,
  align
}: {
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <th
      className="px-3 py-2.5 font-semibold"
      style={{ textAlign: align ?? "left" }}
    >
      {children}
    </th>
  );
}
