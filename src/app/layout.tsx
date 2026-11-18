import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";
import { MotionRoot } from "@/components/motion-root";
import { Nav } from "@/components/nav";
import { Crest, DivisionBadge } from "@/components/ui";
import { club } from "@/lib/config";
import { getClubSummary } from "@/lib/data";
import { divisionOf, fmtDate, kitColors } from "@/lib/format";

export const metadata: Metadata = {
  title: { default: club.name, template: `%s · ${club.name}` },
  description: `Estadísticas de ${club.name} en Clubes Pro: partidos, plantel y la última noche en el Garden.`,
};

export const viewport: Viewport = { themeColor: "#07090a" };

/** Toma los colores reales de la camiseta que devuelve EA. */
async function KitTheme() {
  const { info } = await getClubSummary();
  if (!info) return null;
  const k = kitColors(info);
  return <style>{`:root{--kit-1:${k.primary};--kit-2:${k.secondary};--kit-3:${k.tertiary};}`}</style>;
}

async function HeaderDivision() {
  const { season } = await getClubSummary();
  const div = divisionOf(season);
  return div ? (
    <span className="hidden lg:inline-flex">
      <DivisionBadge division={div.value} size="sm" />
    </span>
  ) : null;
}

async function LastSync() {
  const { lastSync } = await getClubSummary();
  return lastSync ? <>Actualizado {fmtDate(lastSync.at)} hs.</> : null;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Marca que hay JS: recién ahí se esconden las cosas que entran animadas. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-full flex-col">
        <KitTheme />
        <MotionRoot />
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-green focus:px-4 focus:py-2">
          Saltar al contenido
        </a>
        <header className="sticky top-0 z-20 border-b border-line bg-ground/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
            <Link href="/" className="flex min-h-14 items-center gap-3">
              <Crest size={30} />
              <span className="tv hidden text-3xl sm:inline">{club.name}</span>
            </Link>
            <div className="mr-auto hidden lg:block">
              <HeaderDivision />
            </div>
            <Nav />
          </div>
        </header>
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-ink-2 sm:px-6">
            <span>Datos de la API de Clubes de EA SPORTS FC. Sitio no oficial, sin relación con EA.</span>
            <LastSync />
          </div>
        </footer>
      </body>
    </html>
  );
}
