import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/inter";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Crest } from "@/components/ui";
import { club } from "@/lib/config";
import { getClubSummary } from "@/lib/data";
import { kitColors } from "@/lib/format";

export const metadata: Metadata = {
  title: { default: club.name, template: `%s · ${club.name}` },
  description: `Estadísticas de ${club.name} en Clubes Pro`,
};

/** Pisa las variables de color con los de la camiseta que devuelve EA. */
async function KitTheme() {
  const { info } = await getClubSummary();
  if (!info) return null;
  const k = kitColors(info);
  return <style>{`:root{--kit-1:${k.primary};--kit-2:${k.secondary};--kit-3:${k.tertiary};}`}</style>;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <KitTheme />
        <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <Crest size={30} />
              <span className="display text-2xl font-bold">{club.name}</span>
            </Link>
            <Nav />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          Datos de la API pública de Clubes de EA SPORTS FC. Sitio no oficial, sin relación con EA.
        </footer>
      </body>
    </html>
  );
}
