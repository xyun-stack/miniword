import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { LikedBadge } from "./LikedBadge";
import { LocaleSwitch } from "./LocaleSwitch";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

export async function Header() {
  const locale = await getLocale();
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass glass-edge mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <Link href="/" className="flex items-center text-[15px] tracking-tight">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] text-[color:var(--color-ink-muted)] md:flex">
          <Link href="/" className="link-underline">
            {t(locale, "nav.discover")}
          </Link>
          <Link href="/browse" className="link-underline">
            {t(locale, "nav.browse")}
          </Link>
          <Link href="/browse?pack=kissaten" className="link-underline">
            {t(locale, "nav.packs")}
          </Link>
          <Link href="/uploaded" className="link-underline">
            {t(locale, "nav.uploaded")}
          </Link>
          <Link href="/upload" className="link-underline">
            {t(locale, "nav.upload")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitch />
          <LikedBadge />
          <Link
            href="/browse"
            className="btn-secondary !py-1.5 !px-3.5 text-[12px]"
          >
            {t(locale, "btn.browse")}
          </Link>
          <Link
            href="/upload"
            className="btn-primary !py-1.5 !px-3.5 text-[12px]"
          >
            {t(locale, "btn.upload")}
          </Link>
        </div>
      </div>
    </header>
  );
}
