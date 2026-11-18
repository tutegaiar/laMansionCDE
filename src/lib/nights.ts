import type { MatchRow } from "./data";
import { resultOf } from "./format";

/** Una "noche": partidos jugados seguidos, sin cortes de más de 3 horas entre uno y otro. */
export type Night = {
  key: string;
  start: string;
  end: string;
  matches: MatchRow[]; // del más nuevo al más viejo
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
};

const GAP_MS = 3 * 3600 * 1000;

export function groupNights(matches: MatchRow[]): Night[] {
  const sorted = [...matches].sort((a, b) => +new Date(b.playedAt) - +new Date(a.playedAt));
  const nights: Night[] = [];
  let cur: MatchRow[] = [];

  const flush = () => {
    if (!cur.length) return;
    const n: Night = {
      key: cur[cur.length - 1].matchId,
      start: cur[cur.length - 1].playedAt,
      end: cur[0].playedAt,
      matches: cur,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
    };
    for (const m of cur) {
      const r = resultOf(m.goals, m.goalsAgainst);
      if (r === "W") n.w++;
      else if (r === "D") n.d++;
      else n.l++;
      n.gf += m.goals;
      n.ga += m.goalsAgainst;
    }
    nights.push(n);
    cur = [];
  };

  for (const m of sorted) {
    const prev = cur[cur.length - 1];
    if (prev && +new Date(prev.playedAt) - +new Date(m.playedAt) > GAP_MS) flush();
    cur.push(m);
  }
  flush();
  return nights;
}

/** Frase corta del resultado de la noche, sin adornos. */
export function nightHeadline(n: Night): string {
  const total = n.matches.length;
  const pj = `${total} ${total === 1 ? "partido" : "partidos"}`;
  if (n.w === total) return `${pj}, ${total === 1 ? "ganado" : "todos ganados"}`;
  if (n.l === total) return `${pj}, ${total === 1 ? "perdido" : "todos perdidos"}`;
  const parts = [n.w && `${n.w} ${n.w === 1 ? "ganado" : "ganados"}`, n.d && `${n.d} ${n.d === 1 ? "empate" : "empates"}`, n.l && `${n.l} ${n.l === 1 ? "perdido" : "perdidos"}`].filter(Boolean);
  return `${pj}: ${parts.join(", ")}`;
}
