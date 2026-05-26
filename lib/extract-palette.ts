/**
 * Client-side palette extraction.
 *
 * Quantises the image into a 32-step RGB cube, picks the five most
 * populous buckets, and returns their hex codes ordered by population.
 * Good enough for a five-swatch UI without pulling in a heavy
 * dependency.
 */

export type DerivedTone = {
  palette: string[];
  mood: "warm" | "cool" | "mono" | "calm" | "loud";
  motion: "subtle" | "medium" | "active";
};

export async function extractPaletteFromUrl(url: string): Promise<DerivedTone> {
  if (typeof window === "undefined") return fallback();
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("img load failed"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallback();
    ctx.drawImage(img, 0, 0, 64, 64);
    const data = ctx.getImageData(0, 0, 64, 64).data;

    const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue;
      const key = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;
      const cur = buckets.get(key);
      if (cur) {
        cur.count += 1;
        cur.r += r;
        cur.g += g;
        cur.b += b;
      } else {
        buckets.set(key, { count: 1, r, g, b });
      }
    }

    const palette = Array.from(buckets.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((b) => toHex(Math.round(b.r / b.count), Math.round(b.g / b.count), Math.round(b.b / b.count)));

    while (palette.length < 5) palette.push("#EEEEEE");

    return {
      palette,
      mood: deriveMood(palette),
      motion: "subtle"
    };
  } catch {
    return fallback();
  }
}

function fallback(): DerivedTone {
  return {
    palette: ["#EEEEEE", "#D8D8D8", "#BCBCBC", "#9E9E9E", "#7B7B7B"],
    mood: "calm",
    motion: "subtle"
  };
}

function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function deriveMood(palette: string[]): DerivedTone["mood"] {
  let warmth = 0;
  let saturationSum = 0;
  for (const hex of palette) {
    const { r, g, b } = parseHex(hex);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    saturationSum += sat;
    // Simple warm/cool axis: red+green heavy → warm; blue heavy → cool
    warmth += (r + g) / 2 - b;
  }
  const avgSat = saturationSum / palette.length;
  if (avgSat < 0.12) return "mono";
  if (avgSat > 0.55) return "loud";
  if (warmth > 0) return "warm";
  if (warmth < -10) return "cool";
  return "calm";
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}
