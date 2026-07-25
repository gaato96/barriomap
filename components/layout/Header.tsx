"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Grid3x3, Plus, MapPin, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const VIEWS = [
  { href: "/", label: "Mapa 3D", icon: Map },
  { href: "/directorio", label: "Directorio", icon: Grid3x3 },
];

// Estas secciones tienen su propia navegación (con login/logout incluido).
const HIDE_HEADER_PREFIXES = ["/admin", "/panel", "/login"];

export function Header() {
  const pathname = usePathname();
  if (HIDE_HEADER_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="h-5 w-5" />
          </span>
          <span className="text-lg">
            Barrio<span className="text-primary">Map</span>
          </span>
        </Link>

        {/* Conmutador de vistas */}
        <nav className="flex items-center rounded-xl bg-secondary p-1">
          {VIEWS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:flex"
          >
            <LogIn className="h-4 w-4" />
            Acceso
          </Link>
          <Link
            href="/sumar-negocio"
            className={cn(buttonVariants({ variant: "accent", size: "sm" }))}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Sumar mi Negocio</span>
            <span className="sm:hidden">Sumar</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
