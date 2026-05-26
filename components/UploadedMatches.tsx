"use client";

import { useMemo } from "react";
import { useMyUploads } from "@/hooks/useMyUploads";
import { UploadCard } from "@/components/UploadCard";

type Props = {
  device?: string;
  q?: string;
};

/**
 * UploadedMatches — client side companion for /browse. Pulls the local
 * uploads from useMyUploads and renders any that match the current
 * device + search query, so users can find their own uploads through
 * search too. Returns null when nothing matches (no empty section).
 */
export function UploadedMatches({ device, q }: Props) {
  const { items } = useMyUploads();
  const needle = (q ?? "").trim().toLowerCase().replace(/^@/, "");

  const matches = useMemo(() => {
    return items.filter((u) => {
      if (device && device !== "all" && u.device !== device) return false;
      if (needle) {
        const hay = `${u.nickname} ${u.fileName} ${u.idHandle}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [items, device, needle]);

  if (matches.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Your uploads · {matches.length}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {matches.map((u) => (
          <UploadCard key={u.id} upload={u} showRemove={false} />
        ))}
      </div>
    </section>
  );
}
