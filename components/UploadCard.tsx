"use client";

import { useMyUploads, type Upload } from "@/hooks/useMyUploads";
import { findDevice } from "@/lib/devices";

type Props = {
  upload: Upload;
  showRemove?: boolean;
};

export function UploadCard({ upload, showRemove = true }: Props) {
  const { remove } = useMyUploads();
  const device = findDevice(upload.device);

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const pw = window.prompt("Password to remove this upload");
    if (!pw) return;
    try {
      await remove(upload.id, pw);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <a
      href={upload.blobUrl}
      target="_blank"
      rel="noopener noreferrer"
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

          {showRemove && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove upload"
              className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]"
            >
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
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
    </a>
  );
}
