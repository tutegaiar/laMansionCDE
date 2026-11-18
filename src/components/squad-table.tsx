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
    <div className="overflow-x-auto border border-line bg-panel">
      <table className="w-full min-w-[860px] text-base">
        <thead>
          <tr className="border-b border-line text-left text-sm text-ink-2">
            <th className="px-4 py-3 font-semibold">Jugador</th>
            {COLS.map((c) => (
              <th key={c.key} className="px-1 py-1 text-right font-semibold" title={c.title}>
                <button
                  onClick={() => setSort(c.key)}
                  className={`tv min-h-11 px-2 text-xl ${sort === c.key ? "bg-green text-white" : "hover:text-ink"}`}
                  aria-sort={sort === c.key ? "descending" : undefined}
                >
                  {c.label}
                  
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sorted.map((r) => (
            <tr key={r.gamertag} className="transition-colors hover:bg-panel-2">
              <td className="px-4 py-2">
                <Link href={`/jugador/${encodeURIComponent(r.gamertag)}`} className="flex items-center gap-3">
                  {r.avatar}
                  <span className="min-w-0">
                    <span className="tv block truncate text-3xl hover:underline">{r.name}</span>
                    <span className="block text-sm text-ink-2">{r.pos}</span>
                  </span>
                </Link>
              </td>
              {COLS.map((c) => {
                const v = val(r, c.key);
                return (
                  <td
                    key={c.key}
                    className={`tv px-3 py-2 text-right text-3xl ${sort === c.key ? "text-green-ink" : ""}`}
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
