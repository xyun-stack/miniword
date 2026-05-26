import Link from "next/link";
import { notFound } from "next/navigation";
import { Surface } from "@/components/glass/Surface";
import { DeviceFrame } from "@/components/DeviceFrame";
import { findDevice } from "@/lib/devices";
import { findActiveGif } from "@/lib/gifs-server";

type Params = Promise<{ slug: string }>;

export default async function GifDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const gif = await findActiveGif(slug);
  if (!gif) notFound();

  const device = findDevice(gif.device);

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
            <DeviceFrame
              deviceId={gif.device}
              src={gif.gif_url}
              fallbackPattern={gif.fallbackPattern}
              alt={gif.title}
              priority
            />
          </div>
          <div className="mt-7 flex items-center justify-between text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]">
            <span>{device.label}</span>
            <span>
              {device.width} × {device.height}
            </span>
            <span>
              src {gif.width} × {gif.height}
            </span>
          </div>
        </Surface>

        {/* Meta */}
        <aside className="space-y-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
              {gif.author} · {gif.license}
            </p>
            <h1
              className="mt-2 text-[clamp(1.8rem,3.5vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {gif.title}
            </h1>
            {gif.romaji && (
              <p className="mt-1 text-[13px] italic text-[color:var(--color-ink-muted)]">
                {gif.romaji}
              </p>
            )}
          </div>

          <div>
            <p className="text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
              Palette
            </p>
            <div className="mt-2 flex gap-2">
              {gif.palette.map((c) => (
                <div key={c} className="flex flex-col items-center gap-1">
                  <span
                    className="block h-6 w-6 rounded-md"
                    style={{ background: c }}
                  />
                  <span className="font-mono text-[9.5px] tracking-tight text-[color:var(--color-ink-muted)]">
                    {c.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Surface className="grid grid-cols-2 gap-3 px-4 py-3 text-[12px]">
            <Meta k="Mood" v={gif.mood} />
            <Meta k="Motion" v={gif.motion} />
            <Meta k="Device" v={device.label} />
            <Meta k="Tag" v={gif.romaji} />
          </Surface>

          <div className="space-y-2">
            <a
              href={gif.gif_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary block w-full"
            >
              Download .gif
            </a>
            <a href="#" className="btn-secondary block w-full">
              StreamDock .iconPack
            </a>
            <a href="#" className="btn-secondary block w-full">
              xpad-mini .mp4
            </a>
            <p className="pt-1 text-center text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]">
              Source:{" "}
              <a
                href={gif.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                {gif.license}
              </a>
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
