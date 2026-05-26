"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublicUpload } from "@/lib/upload-types";

type Props = {
  uploads: PublicUpload[];
};

export function AdminUploadsTable({ uploads }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, "");
    if (!q) return uploads;
    return uploads.filter((u) =>
      `${u.nickname} ${u.idHandle} ${u.fileName}`.toLowerCase().includes(q)
    );
  }, [uploads, query]);

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this upload? Cannot be undone.");
    if (!ok) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/uploads/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Delete failed" }));
        throw new Error(data.error || `Delete failed (${res.status})`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Filter by @nickname, ID, or filename"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full max-w-md rounded-[12px] px-4 py-2 text-[13px] outline-none transition-colors"
          style={{
            background: "var(--color-bg-soft)",
            color: "var(--color-ink)"
          }}
        />
        <span className="text-[12px] text-[color:var(--color-ink-muted)] tabular-nums">
          {filtered.length} / {uploads.length}
        </span>
      </div>

      {error && (
        <p
          className="text-[12px]"
          style={{ color: "var(--color-pink-deep)" }}
        >
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
              <Th>Author</Th>
              <Th>File</Th>
              <Th align="right">Size</Th>
              <Th align="right">Uploaded</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="align-middle transition-colors hover:bg-[color:var(--color-bg-soft)]"
                style={{ borderTop: "1px solid var(--color-line)" }}
              >
                <td className="px-3 py-2">
                  <a
                    href={u.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-12 w-20 overflow-hidden rounded-md"
                    style={{ background: "var(--color-bg-soft)" }}
                  >
                    <img
                      src={u.blobUrl}
                      alt={u.nickname}
                      className="h-full w-full object-cover"
                    />
                  </a>
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{u.nickname}</div>
                  <div className="text-[11px] text-[color:var(--color-ink-muted)]">
                    {u.idHandle}
                  </div>
                </td>
                <td className="max-w-[280px] px-3 py-2">
                  <div className="truncate">{u.fileName}</div>
                  <div className="text-[11px] text-[color:var(--color-ink-muted)]">
                    {u.fileType} · {u.width} × {u.height} · {u.device}
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-[12px] tabular-nums">
                  {formatBytes(u.fileSize)}
                </td>
                <td className="px-3 py-2 text-right text-[12px] text-[color:var(--color-ink-muted)] tabular-nums">
                  {new Date(u.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(u.id)}
                    disabled={deletingId === u.id || pending}
                    className="inline-flex h-8 items-center rounded-full px-3 text-[11px] uppercase tracking-[0.06em] transition-colors disabled:opacity-50"
                    style={{
                      background: "var(--color-pink)",
                      color: "var(--color-ink)"
                    }}
                  >
                    {deletingId === u.id ? "Removing…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
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

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
