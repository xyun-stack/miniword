"use client";

import Link from "next/link";
import type { Upload } from "@/hooks/useMyUploads";
import type { PublicUpload } from "@/lib/upload-types";
import { findDevice } from "@/lib/devices";

type Props = {
  upload: Upload | PublicUpload;
  /** Pass a remove handler to show the × button (typically only on /uploaded). */
  onRemove?: () => void | Promise<void>;
};

/**
 * UploadCard — display-only card for any uploaded image. Hook-free so it
 * can be rendered inside a server component grid (e.g. /browse).
 * The optional onRemove prop wires the delete button from a parent that
 * holds the credential state (e.g. /uploaded page).
 */
export function UploadCard({ upload, onRemove }: Props) {
  const device = findDevice(upload.device);

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) void onRemove();
  }

  return (
    <Link
      href={`/u/${upload.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-pink-mid)] focus-visible:ring-offset-2 rounded-[16px]"
      aria-label={`${upload.nickname} · ${upload.fileName}`}
    >
      <article>
        <div className="card-hover relative">
          <div
            className="relative overflow-hidden rounded-[14px] bg-[color:var(--color-bg-soft)]"
            style={{ aspectRatio: device.aspect }}
          >
            <img
              src={upload.blobUrl}
              alt={upload.nickname}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove upload"
              className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]"
            >
              <svg
                width={11}
                height={11}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-2 px-0.5">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[12px] font-medium tracking-tight">
              {upload.nickname}
            </h3>
            <p className="mt-0.5 truncate text-[10.5px] text-[color:var(--color-ink-muted)]">
              {upload.fileName} · {device.label}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
