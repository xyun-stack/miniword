"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Surface } from "@/components/glass/Surface";
import { GifCard } from "@/components/GifCard";
import { SAMPLE_GIFS } from "@/lib/sample-data";
import { useLikes } from "@/hooks/useLikes";

export default function LikedPage() {
  const { map, uniqueLiked } = useLikes();

  const items = useMemo(
    () => SAMPLE_GIFS.filter((g) => (map[g.id] ?? 0) > 0),
    [map]
  );

  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Liked
        </p>
        <h1
          className="mt-2 text-[clamp(2rem,4vw,2.8rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your hearts.
        </h1>
        <p className="mt-2 text-[13px] text-[color:var(--color-ink-muted)]">
          {uniqueLiked} saved · this device only
        </p>
      </div>

      {items.length === 0 ? (
        <Surface className="px-6 py-16 text-center">
          <p className="text-[14px] text-[color:var(--color-ink-muted)]">
            Nothing saved yet. Tap the heart on any motion to save it here.
          </p>
          <Link href="/browse" className="btn-primary mt-4 inline-flex">
            Browse
          </Link>
        </Surface>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {items.map((g, i) => (
            <GifCard key={g.id} gif={g} priority={i < 6} />
          ))}
        </div>
      )}
    </div>
  );
}
