import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

/**
 * Layout for the authenticated admin panel. The login page lives outside
 * this route group, so it never inherits this gate — sidestepping the
 * earlier redirect loop where the layout could not detect the login path
 * from request headers.
 */
export default async function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect("/admin/login");

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-baseline gap-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[-0.01em]"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--color-pink-mid)" }}
            />
            miniworld · admin
          </Link>
          <nav className="flex items-center gap-4 text-[12px] text-[color:var(--color-ink-muted)]">
            <Link href="/admin" className="link-underline">
              Dashboard
            </Link>
            <Link href="/admin/uploads" className="link-underline">
              Uploads
            </Link>
            <Link href="/admin/library" className="link-underline">
              Library
            </Link>
            <Link href="/" className="link-underline">
              ↗ Site
            </Link>
          </nav>
        </div>
        <AdminLogoutButton />
      </header>

      <main>{children}</main>
    </div>
  );
}
