"use client";

import Link from "next/link";
import { useLikes } from "@/hooks/useLikes";

/**
 * Header badge: total number of like presses across all GIFs.
 * Reads from the same local store the per-card LikeButtons write to.
 */
export function LikedBadge() {
  const { uniqueLiked } = useLikes();
  const active = uniqueLiked > 0;

  return (
    <Link
      href="/liked"
      aria-label={`${uniqueLiked} liked motions`}
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium tabular-nums transition-colors duration-200 ease-out"
      style={{
        background: active ? "var(--color-pink)" : "var(--color-bg-soft)",
        color: active ? "var(--color-ink)" : "var(--color-ink-muted)"
      }}
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          fill: active ? "var(--color-ink)" : "none",
          stroke: active ? "var(--color-ink)" : "currentColor",
          strokeWidth: active ? 0 : 1.8,
          transition: "fill 200ms ease, stroke 200ms ease"
        }}
      >
        <path d="M12 21s-7-4.35-9.5-9C1 9 3 5.5 6.5 5.5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5.5 23 9 21.5 12 19 16.65 12 21 12 21z" />
      </svg>
      <span>{uniqueLiked}</span>
    </Link>
  );
}
