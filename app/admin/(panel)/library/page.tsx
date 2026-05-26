import { Surface } from "@/components/glass/Surface";
import { AdminLibraryTable } from "@/components/admin/AdminLibraryTable";
import { SAMPLE_GIFS } from "@/lib/sample-data";
import { getRemovedIds } from "@/lib/removed-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLibraryPage() {
  const removed = await getRemovedIds();

  // Mark suppressed items so the admin can see *and undo* deletions.
  const rows = SAMPLE_GIFS.map((g) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    romaji: g.romaji,
    author: g.author,
    device: g.device,
    mood: g.mood,
    motion: g.motion,
    rank: g.rank,
    gif_small_url: g.gif_small_url,
    suppressed: removed.has(g.id)
  }));

  const activeCount = rows.length - removed.size;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
          Library
        </p>
        <h1
          className="mt-1 text-[clamp(1.8rem,3.2vw,2.4rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Crawled GIFs · {activeCount} / {rows.length}
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--color-ink-muted)]">
          Items removed here disappear from the public site immediately.
          Restore to bring them back.
        </p>
      </div>

      {rows.length === 0 ? (
        <Surface className="px-6 py-16 text-center">
          <p className="text-[14px] text-[color:var(--color-ink-muted)]">
            No crawled items found.
          </p>
        </Surface>
      ) : (
        <AdminLibraryTable rows={rows} />
      )}
    </div>
  );
}
