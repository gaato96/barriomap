import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Plus, Inbox, LogOut, Map } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/admin", label: "Negocios", icon: LayoutDashboard },
  { href: "/admin/negocios/nuevo", label: "Nuevo negocio", icon: Plus },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "superadmin") redirect("/panel");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Map className="h-4 w-4" />
            Ver mapa
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-slim">{children}</div>
    </div>
  );
}
