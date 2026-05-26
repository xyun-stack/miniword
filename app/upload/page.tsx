import Link from "next/link";
import { Surface } from "@/components/glass/Surface";
import { DEVICES } from "@/lib/devices";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12 pt-6">
      <div className="text-center">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Upload
        </p>
        <h1
          className="mt-3 text-[clamp(2rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Add a motion.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[color:var(--color-ink-muted)]">
          PNG, JPG, GIF, MP4, WebM. Sized for every supported device.
        </p>
      </div>

      <Surface variant="strong" className="p-2">
        <label className="block cursor-pointer">
          <div
            className="flex min-h-[280px] flex-col items-center justify-center rounded-[18px] border-2 border-dashed px-6 py-12 text-center transition-colors hover:border-[color:var(--color-pink-mid)]"
            style={{ borderColor: "var(--color-line)" }}
          >
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full text-[26px] font-light"
              style={{
                background: "var(--color-pink-wash)",
                color: "var(--color-pink-deep)",
                border: "1px solid var(--color-pink-soft)"
              }}
            >
              +
            </div>
            <p className="text-[15px] font-medium tracking-tight">
              Drop a file, or click to browse.
            </p>
            <p className="mt-1 text-[12px] text-[color:var(--color-ink-muted)]">
              Up to 25 MB
            </p>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.mp4,.webm"
              className="hidden"
            />
          </div>
        </label>
      </Surface>

      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
          Output sizes
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {DEVICES.map((d) => (
            <Surface key={d.id} className="px-4 py-3">
              <p className="text-[13px] font-medium tracking-tight">{d.label}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-[color:var(--color-ink-muted)]">
                {d.width} × {d.height}
              </p>
            </Surface>
          ))}
        </div>
      </div>

      <div className="pt-2 text-center text-[12px] text-[color:var(--color-ink-muted)]">
        <p>
          Choose <span className="font-medium text-[color:var(--color-ink)]">CC0</span> or{" "}
          <span className="font-medium text-[color:var(--color-ink)]">CC-BY</span> at publish
          time. Only upload content you own or have the right to share.
        </p>
        <Link href="/" className="link-underline mt-4 inline-block">
          Back
        </Link>
      </div>
    </div>
  );
}
