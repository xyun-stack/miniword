"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Surface } from "@/components/glass/Surface";
import { findDevice } from "@/lib/devices";
import { extractPaletteFromUrl, type DerivedTone } from "@/lib/extract-palette";
import type { Upload } from "@/hooks/useMyUploads";

type Props = { params: Promise<{ id: string }> };

const FALLBACK_TONE: DerivedTone = {
  palette: ["#EEEEEE", "#D8D8D8", "#BCBCBC", "#9E9E9E", "#7B7B7B"],
  mood: "calm",
  motion: "subtle"
};

export default function UploadDetailPage({ params }: Props) {
  const { id } = use(params);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [error, setError] = useState<"not_found" | "load_failed" | null>(null);
  const [tone, setTone] = useState<DerivedTone>(FALLBACK_TONE);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/uploads/${id}`)
      .then((res) => {
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

  useEffect(() => {
    if (!upload?.blobUrl) return;
    let cancelled = false;
    extractPaletteFromUrl(upload.blobUrl).then((t) => {
      if (!cancelled) setTone(t);
    });
    return () => {
      cancelled = true;
    };
  }, [upload?.blobUrl]);

  if (error === "not_found") {
    return (
      <div className="space-y-10">
        <Link
          href="/browse"
          className="link-underline text-[13px] text-[color:var(--color-ink-muted)]"
        >
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
        <Link
          href="/browse"
          className="link-underline text-[13px] text-[color:var(--color-ink-muted)]"
        >
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
  const displayTitle = humaniseFilename(upload.fileName);
  const romaji = upload.idHandle;
  const tagLabel = ext === "gif" ? "gif" : ext === "png" ? "png" : "jpg";

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

        {/* Meta — mirrors /gif/[slug] layout */}
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
              {romaji}
            </p>
          </div>

          <div>
            <p className="text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
              Palette
            </p>
            <div className="mt-2 flex gap-2">
              {tone.palette.map((c, i) => (
                <div key={`${c}-${i}`} className="flex flex-col items-center gap-1">
                  <span
                    className="block h-6 w-6 rounded-md"
                    style={{ background: c }}
                  />
                  <span className="font-mono text-[9.5px] tracking-tight text-[color:var(--color-ink-muted)]">
                    {c.replace("#", "")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Surface className="grid grid-cols-2 gap-3 px-4 py-3 text-[12px]">
            <Meta k="Mood" v={tone.mood} />
            <Meta k="Motion" v={tone.motion} />
            <Meta k="Device" v={device.label} />
            <Meta k="Tag" v={tagLabel} />
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
            <a href="#" className="btn-secondary block w-full">
              StreamDock .iconPack
            </a>
            <a href="#" className="btn-secondary block w-full">
              xpad-mini .mp4
            </a>
            <p className="pt-1 text-center text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]">
              Source: USER UPLOAD
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

/** Turn a raw filename into a display title: drop extension, swap _- for spaces. */
function humaniseFilename(name: string): string {
  const noExt = name.replace(/\.[^.]+$/, "");
  return noExt.replace(/[_\-]+/g, " ").trim() || name;
}
