"use client";

import Link from "next/link";
import { useState } from "react";
import { Surface } from "@/components/glass/Surface";
import { DEVICES } from "@/lib/devices";

type Status = "idle" | "submitting" | "done";

export default function UploadPage() {
  const [nickname, setNickname] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const credsFilled = nickname.trim().length >= 2 && id.trim().length >= 2 && pw.trim().length >= 4;
  const ready = credsFilled && file !== null && status !== "submitting";

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setStatus("submitting");
    // No backend yet — placeholder for a future POST /api/upload that hashes
    // pw client-side and submits as multipart with the file.
    await new Promise((r) => setTimeout(r, 700));
    setStatus("done");
  }

  function reset() {
    setNickname("");
    setId("");
    setPw("");
    setFile(null);
    setStatus("idle");
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pt-6 text-center">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Submitted
        </p>
        <h1
          className="text-[clamp(2rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Thanks, <span style={{ color: "var(--color-pink-mid)" }}>{nickname || "anon"}</span>.
        </h1>
        <p className="mx-auto max-w-md text-[14px] text-[color:var(--color-ink-muted)]">
          Your motion is in the queue. We'll resize it for every supported device and publish once it clears review.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <button onClick={reset} className="btn-primary">
            Upload another
          </button>
          <Link href="/" className="btn-secondary">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-10 pt-6">
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

      {/* One-time credentials */}
      <Surface variant="strong" className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
            <span aria-hidden className="pink-dot" />
            One-time credentials
          </p>
          <span className="text-[10.5px] uppercase tracking-[0.1em] text-[color:var(--color-ink-faint)]">
            this upload only
          </span>
        </div>

        <Field
          label="Nickname"
          placeholder="@yuna"
          value={nickname}
          onChange={setNickname}
          autoComplete="off"
        />
        <Field
          label="ID"
          placeholder="yuna_2026"
          value={id}
          onChange={setId}
          autoComplete="off"
        />
        <Field
          label="Password"
          placeholder="••••••"
          value={pw}
          onChange={setPw}
          type="password"
          autoComplete="new-password"
        />

        <p className="text-[11.5px] leading-relaxed text-[color:var(--color-ink-muted)]">
          These credentials are single-use. They're attached to this upload only so you can
          edit or remove it later, then discarded. They don't create an account.
        </p>
      </Surface>

      {/* Dropzone */}
      <Surface variant="strong" className="p-2">
        <label
          className="block cursor-pointer"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div
            className="flex min-h-[260px] flex-col items-center justify-center rounded-[18px] border-2 border-dashed px-6 py-12 text-center transition-colors hover:border-[color:var(--color-pink-mid)]"
            style={{ borderColor: file ? "var(--color-pink-mid)" : "var(--color-line)" }}
          >
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full text-[26px] font-light"
              style={{
                background: "var(--color-pink-wash)",
                color: "var(--color-pink-deep)",
                border: "1px solid var(--color-pink-soft)"
              }}
            >
              {file ? "✓" : "+"}
            </div>
            {file ? (
              <>
                <p className="max-w-full truncate text-[14px] font-medium tracking-tight">
                  {file.name}
                </p>
                <p className="mt-1 text-[12px] text-[color:var(--color-ink-muted)]">
                  {(file.size / 1024).toFixed(1)} KB · click to replace
                </p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-medium tracking-tight">
                  Drop a file, or click to browse.
                </p>
                <p className="mt-1 text-[12px] text-[color:var(--color-ink-muted)]">
                  Up to 25 MB
                </p>
              </>
            )}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.mp4,.webm"
              onChange={onFile}
              className="hidden"
            />
          </div>
        </label>
      </Surface>

      {/* Submit */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="submit"
          disabled={!ready}
          className="btn-primary w-full max-w-xs"
          style={{ opacity: ready ? 1 : 0.45, cursor: ready ? "pointer" : "not-allowed" }}
        >
          {status === "submitting" ? "Submitting…" : "Upload"}
        </button>
        {!credsFilled && (
          <p className="text-[11.5px] text-[color:var(--color-ink-muted)]">
            Fill in nickname, ID, and password to continue.
          </p>
        )}
        {credsFilled && !file && (
          <p className="text-[11.5px] text-[color:var(--color-ink-muted)]">
            Choose a file to enable Upload.
          </p>
        )}
      </div>

      {/* Output sizes */}
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
          <span aria-hidden className="pink-dot" />
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
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "password";
  autoComplete?: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="block w-full rounded-[12px] px-4 py-2.5 text-[14px] outline-none transition-colors"
        style={{
          background: "var(--color-bg-soft)",
          color: "var(--color-ink)"
        }}
      />
    </label>
  );
}
