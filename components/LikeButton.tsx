"use client";

import { useEffect, useState } from "react";
import { useLikes } from "@/hooks/useLikes";

type Props = {
  gifId: string;
};

/**
 * LikeButton — small heart that toggles on click. One like per GIF.
 * Sits in the meta row beneath the card image. Cute scale bounce
 * confirms the toggle.
 */
export function LikeButton({ gifId }: Props) {
  const { countFor, add, clear } = useLikes();
  const liked = countFor(gifId) > 0;
  const [bump, setBump] = useState(false);

  // Brief scale bounce whenever the liked state flips (after first paint).
  useEffect(() => {
    if (!liked) return;
    setBump(true);
    const t = window.setTimeout(() => setBump(false), 220);
    return () => window.clearTimeout(t);
  }, [liked]);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (liked) clear(gifId);
        else add(gifId);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="inline-flex select-none items-center justify-center rounded-full p-1"
    >
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          fill: liked ? "var(--color-ink)" : "none",
          stroke: liked ? "var(--color-ink)" : "var(--color-ink-faint)",
          strokeWidth: liked ? 0 : 1.8,
          transform: bump ? "scale(1.25)" : "scale(1)",
          transition:
            "fill 200ms ease, stroke 200ms ease, transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        <path d="M12 21s-7-4.35-9.5-9C1 9 3 5.5 6.5 5.5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5.5 23 9 21.5 12 19 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}
