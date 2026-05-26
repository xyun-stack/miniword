"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "miniword.uploads.v1";
const EVENT = "miniword:uploads-changed";

export type Upload = {
  id: string;
  nickname: string;
  idHandle: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  width: number;
  height: number;
  device: "xpad-mini" | "streamdock-15";
  dataURL: string;
  createdAt: number;
};

/**
 * Local upload store. Persists uploads (as data URLs) to localStorage.
 *
 * No backend: each device sees only its own uploads. Eligible for a future
 * swap-in with a real /api/upload + Vercel Blob without changing this hook's
 * public surface — just replace the storage layer.
 */
export function useMyUploads() {
  const [items, setItems] = useState<Upload[]>([]);

  useEffect(() => {
    setItems(read());
    const onChange = (e: Event) => {
      const d = (e as CustomEvent<{ items: Upload[] }>).detail;
      if (d?.items) setItems([...d.items]);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(read());
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const add = useCallback((u: Upload) => {
    setItems((prev) => {
      const next = [u, ...prev];
      writeOrThrow(next);
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(EVENT, { detail: { items: next } }));
      });
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((u) => u.id !== id);
      writeOrThrow(next);
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(EVENT, { detail: { items: next } }));
      });
      return next;
    });
  }, []);

  return { items, add, remove, count: items.length };
}

function read(): Upload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.filter(isUpload);
    return [];
  } catch {
    return [];
  }
}

function writeOrThrow(items: Upload[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    // QuotaExceeded — most likely on data-URL'd images. Drop the oldest
    // until it fits, so the most recent upload always succeeds.
    let trimmed = [...items];
    while (trimmed.length > 1) {
      trimmed = trimmed.slice(0, -1);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return;
      } catch {
        continue;
      }
    }
    throw err;
  }
}

function isUpload(x: unknown): x is Upload {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Upload).id === "string" &&
    typeof (x as Upload).dataURL === "string" &&
    typeof (x as Upload).nickname === "string"
  );
}

/** Read a File as a base64 data URL. */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

/** Read image dimensions from a data URL. Falls back to 0×0 on failure. */
export function readImageDimensions(
  dataURL: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataURL;
  });
}

/** Classify a device based on actual aspect ratio (matches crawler). */
export function classifyDevice(w: number, h: number): "xpad-mini" | "streamdock-15" {
  if (!w || !h) return "streamdock-15";
  return w / h > 1.4 ? "xpad-mini" : "streamdock-15";
}
