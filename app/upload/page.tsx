"use client";

import Link from "next/link";
import { useState } from "react";
import { Surface } from "@/components/glass/Surface";
import { DEVICES } from "@/lib/devices";
import {
  useMyUploads,
  readFileAsDataURL,
  readImageDimensions,
  classifyDevice
} from "@/hooks/useMyUploads";
import { useLocale } from "@/hooks/useLocale";
import { t } from "@/lib/i18n";

type Status = "idle" | "submitting" | "done" | "error";

export default function UploadPage() {
  const { add } = useMyUploads();
  const { locale } = useLocale();
  const [nickname, setNickname] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const credsFilled =
    nickname.trim().length >= 2 && id.trim().length >= 2 && pw.trim().length >= 4;
  const ready = credsFilled && file !== null && status !== "submitting";

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (status === "error") setStatus("idle");
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || !file) return;
    setStatus("submitting");
    setErrorMsg("");

    try {
      const MAX_BYTES = 200 * 1024; // 200 KB
      if (file.size > MAX_BYTES) {
        const msg = t(locale, "upload.error.fileTooLarge").replace(
          "{size}",
          (file.size / 1024).toFixed(1)
        );
        throw new Error(msg);
      }
      if (!/^image\/(png|jpeg|gif)$/i.test(file.type)) {
        throw new Error(t(locale, "upload.error.unsupported"));
      }

      const dataURL = await readFileAsDataURL(file);
      let { width, height } = await readImageDimensions(dataURL);
      if (!width || !height) {
        // Video files won't load via <img>. Default to landscape and let
        // the user trust the classifier; we can wire a <video> probe later.
        width = 240;
        height = 135;
      }

      const nick = nickname.trim().startsWith("@")
        ? nickname.trim()
        : `@${nickname.trim()}`;

      add({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        nickname: nick,
        idHandle: id.trim(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        width,
        height,
        device: classifyDevice(width, height),
        dataURL,
        createdAt: Date.now()
      });

      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  function reset() {
    setNickname("");
    setId("");
    setPw("");
    setFile(null);
    setErrorMsg("");
    setStatus("idle");
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pt-6 text-center">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Saved
        </p>
        <h1
          className="text-[clamp(2rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Thanks,{" "}
          <span style={{ color: "var(--color-pink-mid)" }}>
            {nickname.startsWith("@") ? nickname : `@${nickname || "anon"}`}
          </span>.
        </h1>
        <p className="mx-auto max-w-md text-[14px] text-[color:var(--color-ink-muted)]">
          Saved to your device. Visit <span className="font-medium text-[color:var(--color-ink)]">Uploaded</span>{" "}
          to see and manage your motions. No server yet, so they live in this browser only.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Link href="/uploaded" className="btn-primary">
            View uploads
          </Link>
          <button onClick={reset} className="btn-secondary">
            Upload another
          </button>
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
          {t(locale, "upload.spec.types")}{" "}
          <span className="font-medium text-[color:var(--color-ink)]">JPG · PNG · GIF</span>
          <br />
          {t(locale, "upload.spec.recommended")}{" "}
          <span className="font-medium text-[color:var(--color-ink)]">240 × 135 px</span> ·{" "}
          {t(locale, "upload.spec.max")}{" "}
          <span className="font-medium text-[color:var(--color-ink)]">200 KB</span>
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
                background: "var(--color-pink)",
                color: "var(--color-pink-deep)",
                border: "0"
              }}
            >
              {file ? "✓" : "+"}
            </div>
            {file ? (
              <>
                <p className="max-w-full truncate text-[14px] font-medium tracking-tight">
                  {file.name}
                </p>
                <p
                  className="mt-1 text-[12px]"
                  style={{
                    color:
                      file.size > 200 * 1024
                        ? "var(--color-ink)"
                        : "var(--color-ink-muted)"
                  }}
                >
                  {(file.size / 1024).toFixed(1)} KB · {t(locale, "upload.dropzone.replace")}
                </p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-medium tracking-tight">
                  Drop a file, or click to browse.
                </p>
                <p className="mt-1 text-[12px] text-[color:var(--color-ink-muted)]">
                  {t(locale, "upload.dropzone.formats")}
                </p>
              </>
            )}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif"
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
        {status === "error" && (
          <p className="text-[11.5px]" style={{ color: "var(--color-ink)" }}>
            {errorMsg}
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

      <div className="pt-2 text-center text-[12px] leading-relaxed text-[color:var(--color-ink-muted)]">
        <p>
          Choose <span className="font-medium text-[color:var(--color-ink)]">CC0</span> or{" "}
          <span className="font-medium text-[color:var(--color-ink)]">CC-BY</span> at publish
          time. Only upload content you own or have the right to share.
        </p>
        <p className="mt-2">
          Uploads that violate our guidelines — copyright infringement, NSFW material,
          or otherwise harmful content — may be removed by moderators at any time
          without notice.
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
