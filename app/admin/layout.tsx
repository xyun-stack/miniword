import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const path = h.get("x-invoke-path") || h.get("next-url") || "";

  // Don't gate /admin/login itself — that page needs to render unauthenticated.
  const isLoginRoute = path.includes("/admin/login");

  if (!isLoginRoute) {
    const ok = await isAdminAuthenticated();
    if (!ok) redirect("/admin/login");
  }

  if (isLoginRoute) {
    return <>{children}</>;
  }

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
