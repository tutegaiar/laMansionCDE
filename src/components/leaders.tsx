"use client";

import Link from "next/link";
import { useState } from "react";

export type LeaderBoard = {
  key: string;
  label: string;
  finding: string;
  rows: { name: string; href: string; value: number; display: string; thumb: React.ReactNode }[];
};

/** Gráfico de líderes estilo TV: pestañas por categoría y barras que crecen. */
export function Leaders({ boards }: { boards: LeaderBoard[] }) {
  const [tab, setTab] = useState(boards[0]?.key);
  const board = boards.find((b) => b.key === tab) ?? boards[0];
  if (!board) return null;
  const max = Math.max(...board.rows.map((r) => r.value), 1);

  return (
    <div className="border border-line bg-panel">
      <div role="tablist" aria-label="Categoría" className="no-scrollbar flex overflow-x-auto border-b border-line">
        {boards.map((b) => (
          <button
            key={b.key}
            role="tab"
            type="button"
            aria-selected={b.key === board.key}
            onClick={() => setTab(b.key)}
            className={`tv relative min-h-12 shrink-0 px-5 py-3 text-2xl transition-colors ${
              b.key === board.key ? "bg-green text-white" : "text-ink-2 hover:text-ink"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="p-5 sm:p-8">
        <p className="mb-6 max-w-2xl text-lg">{board.finding}</p>
        <ol key={board.key} className="space-y-3">
          {board.rows.map((r, i) => (
            <li key={r.name}>
              <Link href={r.href} className="group grid grid-cols-[2rem_auto_1fr_auto] items-center gap-3 sm:gap-4">
                <span className="tv text-2xl text-ink-2">{i + 1}</span>
                {r.thumb}
                <span className="relative block h-10 overflow-hidden bg-panel-2">
                  <span
                    className={`absolute inset-y-0 left-0 origin-left motion-safe:animate-[progress_800ms_var(--ease-out)_both] ${
                      i === 0 ? "bg-green" : "bg-[#2a3330]"
                    }`}
                    style={{ width: `${Math.max(4, (r.value / max) * 100)}%`, animationDelay: `${i * 70}ms` }}
                  />
                  <span className="tv relative flex h-full items-center px-3 text-2xl text-white group-hover:underline">
                    <span className="truncate">{r.name}</span>
                  </span>
                </span>
                <span className={`tv w-16 text-right text-4xl ${i === 0 ? "text-green-ink" : ""}`}>{r.display}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
