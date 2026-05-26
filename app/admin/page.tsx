import Link from "next/link";
import { Surface } from "@/components/glass/Surface";
import { listUploadsServer } from "@/lib/uploads-server";

export default async function AdminDashboardPage() {
  const uploads = await listUploadsServer({ device: null, q: null });

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const last24h = uploads.filter((u) => now - u.createdAt < dayMs).length;
  const totalBytes = uploads.reduce((sum, u) => sum + u.fileSize, 0);
  const avgBytes = uploads.length ? totalBytes / uploads.length : 0;

  // Top uploaders (by count)
  const byHandle = new Map<string, number>();
  for (const u of uploads) {
    byHandle.set(u.idHandle, (byHandle.get(u.idHandle) ?? 0) + 1);
  }
  const topUploaders = Array.from(byHandle.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recent = uploads.slice(0, 6);

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

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Uploads" value={uploads.length.toString()} />
        <StatCard label="Last 24h" value={last24h.toString()} />
        <StatCard
          label="Storage"
          value={formatBytes(totalBytes)}
          hint={`${formatBytes(avgBytes)} avg`}
        />
        <StatCard label="Uploaders" value={byHandle.size.toString()} />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <Surface variant="strong" className="p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
              Recent uploads
            </p>
            <Link
              href="/admin/uploads"
              className="link-underline text-[12px] text-[color:var(--color-ink-muted)]"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-6 text-[13px] text-[color:var(--color-ink-muted)]">
              No uploads yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y" style={{ borderColor: "var(--color-line)" }}>
              {recent.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 py-2.5 text-[13px]"
                >
                  <Link
                    href={u.blobUrl}
                    target="_blank"
                    className="block h-10 w-16 shrink-0 overflow-hidden rounded-md"
                    style={{ background: "var(--color-bg-soft)" }}
                  >
                    <img
                      src={u.blobUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.nickname}</p>
                    <p className="truncate text-[11px] text-[color:var(--color-ink-muted)]">
                      {u.fileName}
                    </p>
                  </div>
                  <span className="text-[11px] tabular-nums text-[color:var(--color-ink-muted)]">
                    {formatBytes(u.fileSize)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <Surface variant="strong" className="p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
            Top uploaders
          </p>
          {topUploaders.length === 0 ? (
            <p className="mt-6 text-[13px] text-[color:var(--color-ink-muted)]">
              —
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-[13px]">
              {topUploaders.map(([handle, n]) => (
                <li
                  key={handle}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium">{handle}</span>
                  <span className="tabular-nums text-[color:var(--color-ink-muted)]">
                    {n}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-[14px] p-4"
      style={{
        background: "var(--color-bg-soft)"
      }}
    >
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
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
