"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Surface } from "@/components/glass/Surface";
import { findDevice } from "@/lib/devices";
import type { Upload } from "@/hooks/useMyUploads";

type Props = { params: Promise<{ id: string }> };

export default function UploadDetailPage({ params }: Props) {
  const { id } = use(params);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/uploads/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setError("not_found");
          return null;
        }
        if (!res.ok) {
          if (!cancelled) setError("load_failed");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data) setUpload(data as Upload);
      })
      .catch(() => {
        if (!cancelled) setError("load_failed");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error === "not_found") {
    return (
      <div className="space-y-10">
        <Link href="/browse" className="link-underline text-[13px] text-[color:var(--color-ink-muted)]">
          ← Browse
        </Link>
        <Surface className="px-6 py-16 text-center">
          <p className="text-[14px] text-[color:var(--color-ink-muted)]">
            This upload no longer exists.
          </p>
        </Surface>
      </div>
    );
  }

  if (!upload) {
    return (
      <div className="space-y-10">
        <Link href="/browse" className="link-underline text-[13px] text-[color:var(--color-ink-muted)]">
          ← Browse
        </Link>
        <Surface className="px-6 py-16 text-center">
          <p className="text-[14px] text-[color:var(--color-ink-muted)]">Loading…</p>
        </Surface>
      </div>
    );
  }

  const device = findDevice(upload.device);
  const ext = (upload.fileType.split("/")[1] || "file").toLowerCase();
  const displayTitle = upload.fileName.replace(/\.[^.]+$/, "");

  return (
    <div className="space-y-12">
      <div>
        <Link
          href="/browse"
          className="link-underline text-[13px] text-[color:var(--color-ink-muted)]"
        >
          ← Browse
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_22rem]">
        {/* Preview */}
        <Surface variant="strong" className="p-8 md:p-10">
          <div className="mx-auto w-full max-w-sm">
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
          </div>
          <div className="mt-7 flex items-center justify-between text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]">
            <span>{device.label}</span>
            <span>
              {device.width} × {device.height}
            </span>
            <span>
              src {upload.width} × {upload.height}
            </span>
          </div>
        </Surface>

        {/* Meta */}
        <aside className="space-y-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
              {upload.nickname} · UPLOAD
            </p>
            <h1
              className="mt-2 text-[clamp(1.8rem,3.5vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {displayTitle}
            </h1>
            <p className="mt-1 text-[13px] italic text-[color:var(--color-ink-muted)]">
              {upload.idHandle}
            </p>
          </div>

          <Surface className="grid grid-cols-2 gap-3 px-4 py-3 text-[12px]">
            <Meta k="Device" v={device.label} />
            <Meta k="Size" v={`${upload.width} × ${upload.height}`} />
            <Meta k="File" v={`${(upload.fileSize / 1024).toFixed(1)} KB`} />
            <Meta
              k="Uploaded"
              v={new Date(upload.createdAt).toLocaleDateString()}
            />
          </Surface>

          <div className="space-y-2">
            <a
              href={upload.blobUrl}
              download={upload.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary block w-full"
            >
              Download .{ext}
            </a>
            <p className="pt-1 text-center text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]">
              Source: user upload
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]">
        {k}
      </p>
      <p className="mt-0.5 text-[13px] font-medium">{v}</p>
    </div>
  );
}
