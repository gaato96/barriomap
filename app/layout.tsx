import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "BarrioMap — Comercios y showrooms de tu barrio",
  description:
    "Descubrí en un mapa 3D los comercios, showrooms y emprendedores cerca tuyo en San Miguel de Tucumán. Buscá productos y contactá directo por WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body className="flex h-full flex-col overflow-hidden">
        <Header />
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
