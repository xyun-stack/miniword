import Link from "next/link";
import type { GifItem } from "@/lib/sample-data";
import { findDevice } from "@/lib/devices";
import { DeviceFrame } from "./DeviceFrame";
import { LikeButton } from "./LikeButton";

type Props = {
  gif: GifItem;
  priority?: boolean;
  showStamp?: boolean;
  size?: "sm" | "md";
};

export function GifCard({ gif, priority = false, showStamp = false, size = "sm" }: Props) {
  const device = findDevice(gif.device);
  const titleClass = size === "md" ? "text-[13.5px] font-medium" : "text-[12px] font-medium";
  const subClass = size === "md" ? "text-[11.5px]" : "text-[10.5px]";

  return (
    <Link
      href={`/gif/${gif.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] focus-visible:ring-offset-2 rounded-[16px]"
      aria-label={`${gif.title} by ${gif.author}`}
    >
      <article>
        <div className="card-hover relative">
          <DeviceFrame
            deviceId={gif.device}
            src={gif.gif_small_url || gif.gif_url}
            poster={gif.poster_url}
            fallbackPattern={gif.fallbackPattern}
            alt={`${gif.title}, ${gif.author}`}
            priority={priority}
          />
          {showStamp && (
            <div className="pointer-events-none absolute right-2 top-2 z-10">
              <span className="stamp">Pick</span>
            </div>
          )}
        </div>

        <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
          <div className="min-w-0 flex-1">
            <h3 className={`truncate tracking-tight ${titleClass}`}>{gif.title}</h3>
            <p className={`mt-0.5 truncate text-[color:var(--color-ink-muted)] ${subClass}`}>
              {gif.author} · {device.label}
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <LikeButton gifId={gif.id} />
          </div>
        </div>
      </article>
    </Link>
  );
}
