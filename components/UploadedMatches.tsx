"use client";

import { useEffect, useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import type { Upload } from "@/hooks/useMyUploads";

type Props = {
  device?: string;
  q?: string;
};

/**
 * Server-backed companion for /browse. Fetches uploads from the API
 * filtered by device + q so users can find any upload, not just their own.
 * Returns null while loading or when there are no matches.
 */
export function UploadedMatches({ device, q }: Props) {
  const [items, setItems] = useState<Upload[] | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (device && device !== "all") sp.set("device", device);
    if (q && q.trim()) sp.set("q", q.trim());
    const qs = sp.toString();
    let cancelled = false;
    fetch(`/api/uploads${qs ? `?${qs}` : ""}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: Upload[] }) => {
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [device, q]);

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Uploads · {items.length}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {items.map((u) => (
          <UploadCard key={u.id} upload={u} showRemove={false} />
        ))}
      </div>
    </section>
  );
}
