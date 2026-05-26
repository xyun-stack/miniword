"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "miniword.likes.v2";
const LEGACY_KEY = "miniword.likes.v1";
const EVENT = "miniword:likes-changed";

type LikesMap = Record<string, number>;

/**
 * Likes are stored as a count per GIF id, so the user can press the heart
 * multiple times and the card reflects how many times they've tapped it.
 *
 * Persistence: localStorage, plus a CustomEvent so any other component
 * rendered in the same tab stays in sync.
 *
 * The dispatchEvent is wrapped in queueMicrotask so it never fires during
 * a React render (otherwise listeners would call setState while another
 * component is still rendering).
 */
export function useLikes() {
  const [map, setMap] = useState<LikesMap>(() => ({}));

  useEffect(() => {
    setMap(readStorage());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ map: LikesMap }>).detail;
      if (detail?.map) setMap({ ...detail.map });
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === LEGACY_KEY) setMap(readStorage());
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const countFor = useCallback((id: string) => map[id] ?? 0, [map]);

  const add = useCallback((id: string) => {
    setMap((prev) => {
      const next: LikesMap = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      writeStorage(next);
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(EVENT, { detail: { map: next } }));
      });
      return next;
    });
  }, []);

  const clear = useCallback((id: string) => {
    setMap((prev) => {
      if (!(id in prev)) return prev;
      const next: LikesMap = { ...prev };
      delete next[id];
      writeStorage(next);
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(EVENT, { detail: { map: next } }));
      });
      return next;
    });
  }, []);

  const totalPresses = Object.values(map).reduce((sum, n) => sum + n, 0);
  const uniqueLiked = Object.values(map).filter((n) => n > 0).length;

  return {
    map,
    countFor,
    add,
    clear,
    totalPresses,
    uniqueLiked
  };
}

function readStorage(): LikesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const out: LikesMap = {};
        for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
          if (typeof v === "number" && v > 0) out[k] = v;
        }
        return out;
      }
    }
    // Migrate v1 array of ids → v2 map with count 1.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown;
      if (Array.isArray(parsed)) {
        const out: LikesMap = {};
        for (const id of parsed) if (typeof id === "string") out[id] = 1;
        writeStorage(out);
        return out;
      }
    }
    return {};
  } catch {
    return {};
  }
}

function writeStorage(map: LikesMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota / private mode — silently drop */
  }
}
