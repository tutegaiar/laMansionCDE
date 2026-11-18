"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  { href: "/", label: "Resumen" },
  { href: "/plantel", label: "Plantel" },
  { href: "/partidos", label: "Partidos" },
];

function NavLinks({ path }: { path: string | null }) {
  return (
    <nav aria-label="Principal" className="flex">
      {LINKS.map((l) => {
        const active =
          l.href === "/"
            ? path === "/"
            : !!path && (path.startsWith(l.href) || (l.href === "/plantel" && path.startsWith("/jugador")));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`tv relative grid min-h-11 place-items-center px-3 text-2xl transition-colors sm:px-4 ${
              active ? "bg-green text-white" : "text-ink-2 hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNav() {
  return <NavLinks path={usePathname()} />;
}

export function Nav() {
  return (
    <Suspense fallback={<NavLinks path={null} />}>
      <ActiveNav />
    </Suspense>
  );
}
