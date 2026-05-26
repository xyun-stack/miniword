import { Surface } from "@/components/glass/Surface";
import { AdminUploadsTable } from "@/components/admin/AdminUploadsTable";
import { listUploadsServer } from "@/lib/uploads-server";

export default async function AdminUploadsPage() {
  const uploads = await listUploadsServer({ device: null, q: null });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
          Moderation
        </p>
        <h1
          className="mt-1 text-[clamp(1.8rem,3.2vw,2.4rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Uploads · {uploads.length}
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--color-ink-muted)]">
          Newest first. Click a row's image to inspect; the trash icon removes
          immediately.
        </p>
      </div>

      {uploads.length === 0 ? (
        <Surface className="px-6 py-16 text-center">
          <p className="text-[14px] text-[color:var(--color-ink-muted)]">
            No uploads on the server.
          </p>
        </Surface>
      ) : (
        <AdminUploadsTable uploads={uploads} />
      )}
    </div>
  );
}
