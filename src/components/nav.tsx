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
    <nav className="flex gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" : !!path && (path.startsWith(l.href) || (l.href === "/plantel" && path.startsWith("/jugador")));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`display rounded-lg px-3 py-1.5 text-lg font-semibold transition-colors ${
              active ? "bg-kit text-white" : "text-muted hover:text-fg"
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
