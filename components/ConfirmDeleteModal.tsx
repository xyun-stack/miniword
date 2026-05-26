"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (pw: string) => Promise<void>;
  title?: string;
  description?: string;
};

/**
 * ConfirmDeleteModal — centred password-confirmation dialog used for
 * destructive actions like removing an upload. Native dialog patterns
 * (escape to close, focus the input on open, click-outside to dismiss)
 * all wired up; styling matches the rest of miniworld (white card with
 * hairline border, pink primary action, no glow).
 */
export function ConfirmDeleteModal({
  open,
  onCancel,
  onConfirm,
  title = "Delete upload?",
  description = "Enter the password you set when uploading. This can't be undone."
}: Props) {
  const [pw, setPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state + focus when the modal opens.
  useEffect(() => {
    if (!open) return;
    setPw("");
    setError(null);
    setSubmitting(false);
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  // Escape closes; lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onCancel();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, submitting, onCancel]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(pw);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => !submitting && onCancel()}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(20, 20, 26, 0.42)" }}
      />

      {/* Dialog */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[400px] rounded-[20px] p-6 sm:p-7"
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-line-strong)"
        }}
      >
        <p className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-pink-deep)]">
          <span aria-hidden className="pink-dot" />
          Confirm
        </p>
        <h2
          id="confirm-delete-title"
          className="mt-2 text-[20px] font-semibold tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-ink-muted)]">
          {description}
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
            Password
          </span>
          <input
            ref={inputRef}
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="block w-full rounded-[12px] px-4 py-2.5 text-[14px] outline-none transition-colors"
            style={{
              background: "var(--color-bg-soft)",
              color: "var(--color-ink)"
            }}
            placeholder="••••••"
            autoComplete="current-password"
            disabled={submitting}
          />
        </label>

        {error && (
          <p
            className="mt-2 text-[11.5px]"
            style={{ color: "var(--color-pink-deep)" }}
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => !submitting && onCancel()}
            disabled={submitting}
            className="btn-secondary flex-1"
            style={{ opacity: submitting ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!pw || submitting}
            className="btn-primary flex-1"
            style={{
              opacity: !pw || submitting ? 0.5 : 1,
              cursor: !pw || submitting ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
