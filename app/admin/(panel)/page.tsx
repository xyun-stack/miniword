import Link from "next/link";
import { SAMPLE_GIFS } from "@/lib/sample-data";
import { getRemovedIds } from "@/lib/removed-server";
import { listUploadsServer } from "@/lib/uploads-server";

export default async function AdminDashboardPage() {
  const [removed, uploads] = await Promise.all([
    getRemovedIds(),
    listUploadsServer({ device: null, q: null })
  ]);

  const crawledTotal = SAMPLE_GIFS.length;
  const crawledActive = crawledTotal - removed.size;
  const crawledHidden = removed.size;
  const uploadCount = uploads.length;
  const totalContent = crawledActive + uploadCount;
  const storageBytes = uploads.reduce((s, u) => s + u.fileSize, 0);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
          Overview
        </p>
        <h1
          className="mt-1 text-[clamp(1.8rem,3.2vw,2.4rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Operator dashboard.
        </h1>
      </div>

      {/* Headline total */}
      <div
        className="rounded-[18px] p-6"
        style={{ background: "var(--color-bg-soft)" }}
      >
        <p className="text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
          Total content live on site
        </p>
        <p
          className="mt-1 text-[64px] font-semibold tabular-nums leading-none tracking-[-0.03em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {totalContent.toLocaleString()}
        </p>
        <p className="mt-3 text-[12.5px] text-[color:var(--color-ink-muted)]">
          {crawledActive.toLocaleString()} crawled · {uploadCount.toLocaleString()} user uploads
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Crawled"
          value={`${crawledActive}`}
          hint={`of ${crawledTotal}`}
          href="/admin/library"
        />
        <StatCard
          label="Hidden"
          value={`${crawledHidden}`}
          hint="by admin"
          href="/admin/library"
        />
        <StatCard
          label="Uploads"
          value={`${uploadCount}`}
          hint={storageBytes > 0 ? formatBytes(storageBytes) : "0 B"}
          href="/admin/uploads"
        />
        <StatCard
          label="Last 24h"
          value={`${
            uploads.filter((u) => Date.now() - u.createdAt < 86_400_000).length
          }`}
          hint="new uploads"
        />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  href
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
        {label}
      </p>
      <p
        className="mt-1 text-[26px] font-semibold tabular-nums leading-none tracking-[-0.02em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[11px] text-[color:var(--color-ink-muted)]">
          {hint}
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[14px] p-4 transition-colors hover:bg-[color:var(--color-bg-raised)]"
        style={{ background: "var(--color-bg-soft)" }}
      >
        {body}
      </Link>
    );
  }
  return (
    <div
      className="rounded-[14px] p-4"
      style={{ background: "var(--color-bg-soft)" }}
    >
      {body}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
