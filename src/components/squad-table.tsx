"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SquadRow = {
  gamertag: string;
  name: string;
  pos: string;
  avatar: React.ReactNode;
  gp: number;
  goals: number;
  assists: number;
  rating: number;
  mom: number;
  passPct: number;
  winPct: number;
  ovr: number;
  cleanSheets: number;
};

type Key = Exclude<keyof SquadRow, "gamertag" | "name" | "pos" | "avatar"> | "ga" | "gpm";

const COLS: { key: Key; label: string; title: string; fmt?: (v: number) => string }[] = [
  { key: "gp", label: "PJ", title: "Partidos jugados" },
  { key: "goals", label: "G", title: "Goles" },
  { key: "assists", label: "A", title: "Asistencias" },
  { key: "ga", label: "G+A", title: "Goles + asistencias" },
  { key: "gpm", label: "G+A/PJ", title: "Goles + asistencias por partido", fmt: (v) => v.toFixed(2) },
  { key: "rating", label: "Rating", title: "Rating promedio", fmt: (v) => v.toFixed(1) },
  { key: "mom", label: "MVP", title: "Figura del partido" },
  { key: "cleanSheets", label: "VI", title: "Vallas invictas" },
  { key: "passPct", label: "% Pase", title: "Efectividad de pase", fmt: (v) => `${v}%` },
  { key: "winPct", label: "% Vic", title: "Porcentaje de victorias", fmt: (v) => `${v}%` },
  { key: "ovr", label: "OVR", title: "Media del Pro" },
];

const val = (r: SquadRow, k: Key) =>
  k === "ga" ? r.goals + r.assists : k === "gpm" ? (r.gp ? (r.goals + r.assists) / r.gp : 0) : r[k];

export function SquadTable({ rows }: { rows: SquadRow[] }) {
  const [sort, setSort] = useState<Key>("ga");
  const sorted = useMemo(() => [...rows].sort((a, b) => val(b, sort) - val(a, sort)), [rows, sort]);

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
            <th className="px-4 py-3 font-medium">Jugador</th>
            {COLS.map((c) => (
              <th key={c.key} className="px-2 py-3 text-right font-medium" title={c.title}>
                <button
                  onClick={() => setSort(c.key)}
                  className={`uppercase ${sort === c.key ? "text-accent" : "hover:text-fg"}`}
                  aria-sort={sort === c.key ? "descending" : undefined}
                >
                  {c.label}
                  {sort === c.key ? " ↓" : ""}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sorted.map((r) => (
            <tr key={r.gamertag} className="row-link">
              <td className="px-4 py-2.5">
                <Link href={`/jugador/${encodeURIComponent(r.gamertag)}`} className="flex items-center gap-3">
                  {r.avatar}
                  <span className="min-w-0">
                    <span className="block truncate font-medium hover:text-accent">{r.name}</span>
                    <span className="block text-xs text-muted">{r.pos}</span>
                  </span>
                </Link>
              </td>
              {COLS.map((c) => {
                const v = val(r, c.key);
                return (
                  <td
                    key={c.key}
                    className={`px-2 py-2.5 text-right tabular-nums ${sort === c.key ? "font-semibold text-fg" : "text-fg/80"}`}
                  >
                    {c.fmt ? c.fmt(v) : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
