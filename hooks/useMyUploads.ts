"use client";

import { useCallback, useEffect, useState } from "react";

const ID_HANDLE_KEY = "miniword.idHandle";

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
  /** URL of the uploaded media (Vercel Blob CDN). Replaces the old dataURL. */
  blobUrl: string;
  createdAt: number;
};

type AddArgs = {
  file: File;
  nickname: string;
  idHandle: string;
  pw: string;
  width: number;
  height: number;
  device: "xpad-mini" | "streamdock-15";
};

/**
 * Server-backed uploads. Lists only the uploads owned by the local user's
 * idHandle (saved on first upload). Each call to the server is fresh — no
 * persistence beyond an in-memory cache for the current render.
 */
export function useMyUploads() {
  const [items, setItems] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    setLoading(true);
    const idHandle = window.localStorage.getItem(ID_HANDLE_KEY);
    const qs = idHandle ? `?idHandle=${encodeURIComponent(idHandle)}` : "";
    try {
      const res = await fetch(`/api/uploads${qs}`);
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = (await res.json()) as { items: Upload[] };
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (args: AddArgs): Promise<Upload> => {
      const form = new FormData();
      form.append("file", args.file);
      form.append("nickname", args.nickname);
      form.append("idHandle", args.idHandle);
      form.append("pw", args.pw);
      form.append("width", String(args.width));
      form.append("height", String(args.height));
      form.append("device", args.device);

      const res = await fetch("/api/uploads", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || `Upload failed (${res.status})`);
      }
      const item = (await res.json()) as Upload;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(ID_HANDLE_KEY, args.idHandle);
      }
      setItems((prev) => [item, ...prev]);
      return item;
    },
    []
  );

  const remove = useCallback(async (id: string, pw: string) => {
    const res = await fetch(`/api/uploads/${id}`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pw })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Delete failed" }));
      throw new Error(err.error || `Delete failed (${res.status})`);
    }
    setItems((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return { items, loading, add, remove, refresh, count: items.length };
}

/** Read a File as a base64 data URL — used only for client-side preview. */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

/** Read image dimensions from a data URL. Returns 0×0 on failure. */
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

export function classifyDevice(w: number, h: number): Upload["device"] {
  if (!w || !h) return "streamdock-15";
  return w / h > 1.4 ? "xpad-mini" : "streamdock-15";
}
