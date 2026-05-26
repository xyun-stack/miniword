"use client";

import { useEffect, useRef, useState } from "react";
import { findDevice } from "@/lib/devices";

type Props = {
  deviceId: string;
  src?: string | null;
  poster?: string | null;
  fallbackPattern?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
};

/**
 * DeviceFrame renders a single LCD key at the device's exact aspect ratio.
 * Flat: no vignette, no inset shadow. Just the image, cropped to the key.
 */
export function DeviceFrame({
  deviceId,
  src,
  fallbackPattern = "motion-paper",
  alt = "",
  className = "",
  priority = false
}: Props) {
  const device = findDevice(deviceId);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden rounded-[14px] bg-[color:var(--color-bg-soft)] ${className}`}
      style={{ aspectRatio: device.aspect }}
    >
      {src && !failed ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-opacity duration-500 ease-out"
          draggable={false}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      ) : (
        <div className={`absolute inset-0 ${fallbackPattern}`} />
      )}
    </div>
  );
}
