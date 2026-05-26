"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import type { Upload } from "@/hooks/useMyUploads";

type Props = {
  limit?: number;
};

/**
 * RecentUploads — homepage section that surfaces the latest community
 * uploads so visitors discover them without needing to search. Renders
 * nothing while loading or empty so it never adds dead chrome.
 */
export function RecentUploads({ limit = 12 }: Props) {
  const [items, setItems] = useState<Upload[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/uploads`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: Upload[] }) => {
        if (cancelled) return;
        const sliced = Array.isArray(data.items) ? data.items.slice(0, limit) : [];
        setItems(sliced);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (!items || items.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
            From the community
          </p>
          <h2
            className="mt-1 text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Latest uploads.
          </h2>
        </div>
        <Link
          href="/browse?device=all"
          className="link-underline text-[13px] text-[color:var(--color-ink-muted)]"
        >
          View all
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((u) => (
          <UploadCard key={u.id} upload={u} />
        ))}
      </div>
    </section>
  );
}
