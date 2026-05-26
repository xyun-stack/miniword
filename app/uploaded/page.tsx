"use client";

import Link from "next/link";
import { Surface } from "@/components/glass/Surface";
import { UploadCard } from "@/components/UploadCard";
import { useMyUploads } from "@/hooks/useMyUploads";

export default function UploadedPage() {
  const { items } = useMyUploads();

  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Uploaded
        </p>
        <h1
          className="mt-2 text-[clamp(2rem,4vw,2.8rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your uploads.
        </h1>
        <p className="mt-2 text-[13px] text-[color:var(--color-ink-muted)]">
          {items.length} saved · this device only
        </p>
      </div>

      {items.length === 0 ? (
        <Surface className="px-6 py-16 text-center">
          <p className="text-[14px] text-[color:var(--color-ink-muted)]">
            Nothing here yet. Upload one to see it on this page.
          </p>
          <Link href="/upload" className="btn-primary mt-4 inline-flex">
            Upload
          </Link>
        </Surface>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {items.map((u) => (
            <UploadCard key={u.id} upload={u} />
          ))}
        </div>
      )}

      <div className="mx-auto max-w-md space-y-2 text-center text-[11.5px] leading-relaxed text-[color:var(--color-ink-muted)]">
        <p>
          Uploads are saved to your device only. They don't sync across browsers or
          appear in other people's libraries until we add a server. Clear your
          browser data and they're gone.
        </p>
        <p>
          Once shared publicly, content that violates our guidelines may be
          removed by moderators at any time without notice.
        </p>
      </div>
    </div>
  );
}
