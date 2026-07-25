import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Store, LogOut, Map } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/panel/productos", label: "Productos y ofertas", icon: Package },
  { href: "/panel/negocio", label: "Mi negocio", icon: Store },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/panel");
  if (user.role !== "owner") redirect("/admin");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-1">
          {user.businessId &&
            NAV.map(({ href, label, icon: Icon }) => (
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

      <div className="flex-1 overflow-y-auto scroll-slim">
        {user.businessId ? (
          children
        ) : (
          <div className="mx-auto max-w-md px-4 py-16 text-center">
            <h1 className="text-lg font-semibold">Todavía no tenés un negocio asignado</h1>
            <p className="mt-2 text-muted-foreground">
              Contactá al administrador de BarrioMap para que vincule tu cuenta a tu negocio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
