"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SquadRow = {
  gamertag: string;
  name: string;
  sub: string | null;
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
  yellow: number;
  red: number;
  fouls: number;
};

type Key = Exclude<keyof SquadRow, "gamertag" | "name" | "sub" | "pos" | "avatar"> | "ga" | "gpm";

const COLS: { key: Key; label: string; title: string; fmt?: (v: number) => string }[] = [
  { key: "gp", label: "PJ", title: "Partidos jugados" },
  { key: "goals", label: "G", title: "Goles" },
  { key: "assists", label: "A", title: "Asistencias" },
  { key: "ga", label: "G+A", title: "Goles + asistencias" },
  { key: "gpm", label: "G+A/PJ", title: "Goles + asistencias por partido", fmt: (v) => v.toFixed(2) },
  { key: "rating", label: "Rating", title: "Rating promedio", fmt: (v) => v.toFixed(1) },
  { key: "mom", label: "MVP", title: "Figura del partido" },
  { key: "cleanSheets", label: "VI", title: "Vallas invictas" },
  { key: "yellow", label: "TA", title: "Tarjetas amarillas (partidos guardados)" },
  { key: "red", label: "TR", title: "Tarjetas rojas" },
  { key: "fouls", label: "Faltas", title: "Faltas cometidas (partidos guardados)" },
  { key: "passPct", label: "% Pase", title: "Efectividad de pase", fmt: (v) => `${v}%` },
  { key: "winPct", label: "% Vic", title: "Porcentaje de victorias", fmt: (v) => `${v}%` },
  { key: "ovr", label: "OVR", title: "Media del Pro" },
];

const val = (r: SquadRow, k: Key) =>
  k === "ga" ? r.goals + r.assists : k === "gpm" ? (r.gp ? (r.goals + r.assists) / r.gp : 0) : r[k];

export function SquadTable({ rows }: { rows: SquadRow[] }) {
  const [sort, setSort] = useState<Key>("ga");
  const sorted = useMemo(() => [...rows].sort((a, b) => val(b, sort) - val(a, sort)), [rows, sort]);

  const col = COLS.find((c) => c.key === sort)!;

  return (
    <>
      {/* Celular: lista con el dato elegido en grande, sin tabla que scrollee de costado. */}
      <div className="md:hidden">
        <label className="mb-3 flex items-center gap-3 text-base">
          <span className="shrink-0 text-ink-2">Ordenar por</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Key)}
            className="tv min-h-11 w-full min-w-0 flex-1 border border-line bg-panel px-3 text-2xl text-ink"
          >
            {COLS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <ol className="flex flex-col gap-px bg-line">
          {sorted.map((r, i) => {
            const v = val(r, sort);
            return (
              <li key={r.gamertag}>
                <Link
                  href={`/jugador/${encodeURIComponent(r.gamertag)}`}
                  className="grid grid-cols-[1.5rem_auto_minmax(0,1fr)_auto] items-center gap-3 bg-panel py-2 pr-4 pl-3"
                >
                  <span className="tv text-xl text-ink-2">{i + 1}</span>
                  {r.avatar}
                  <span className="min-w-0">
                    <span className="tv block truncate text-3xl">{r.name}</span>
                    <span className="block truncate text-sm text-ink-2">
                      {r.sub ? `${r.sub} · ` : ""}
                      {r.goals} G · {r.assists} A · {r.rating.toFixed(1)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="tv block text-4xl text-green-ink">{col.fmt ? col.fmt(v) : v}</span>
                    <span className="block text-sm text-ink-2">{col.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

    <div className="hidden overflow-x-auto border border-line bg-panel md:block">
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
                    <span className="block text-sm text-ink-2">
                      {r.pos}
                      {r.sub ? ` · ${r.sub}` : ""}
                    </span>
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
    </>
  );
}
