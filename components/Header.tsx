import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { LikedBadge } from "./LikedBadge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass glass-edge mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center text-[15px] tracking-tight">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] text-[color:var(--color-ink-muted)] md:flex">
          <Link href="/" className="link-underline">
            Discover
          </Link>
          <Link href="/browse" className="link-underline">
            Browse
          </Link>
          <Link href="/browse?pack=kissaten" className="link-underline">
            Packs
          </Link>
          <Link href="/uploaded" className="link-underline">
            Uploaded
          </Link>
          <Link href="/upload" className="link-underline">
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LikedBadge />
          <Link
            href="/browse"
            className="btn-secondary !py-1.5 !px-3.5 text-[12px]"
          >
            Browse
          </Link>
          <Link
            href="/upload"
            className="btn-primary !py-1.5 !px-3.5 text-[12px]"
          >
            Upload
          </Link>
        </div>
      </div>
    </header>
  );
}
