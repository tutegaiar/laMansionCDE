/**
 * EA manda los eventos de cada jugador en `match_event_aggregate_0..3` como "id:cantidad,id:cantidad".
 * EA no publica qué es cada id; los usados acá son los confirmados por la investigación de la comunidad:
 * https://github.com/Interactive-63/eafc-pro-clubs-api-research
 */

export type EventCounts = Record<number, number>;

export function parseEvents(p: Record<string, unknown>): EventCounts {
  const out: EventCounts = {};
  for (let i = 0; i < 4; i++) {
    const raw = String(p[`match_event_aggregate_${i}`] ?? "");
    for (const pair of raw.split(",")) {
      const [k, v] = pair.split(":");
      const id = Number(k);
      const n = Number(v);
      if (Number.isFinite(id) && Number.isFinite(n)) out[id] = (out[id] ?? 0) + n;
    }
  }
  return out;
}

const n = (e: EventCounts, ...ids: number[]) => ids.reduce((a, id) => a + (e[id] ?? 0), 0);

export type ExtraStats = {
  yellow: number; // 95 inmediata + 213 con ventaja
  fouls: number; // 2 + 3 faltas cometidas
  foulsWon: number; // 4
  interceptions: number; // 6
  shotsOnTarget: number; // 217, o 13 + 18
  dribbles: number; // 174
};

export function extraStats(p: Record<string, unknown>): ExtraStats {
  const e = parseEvents(p);
  return {
    yellow: n(e, 95, 213),
    fouls: n(e, 2, 3),
    foulsWon: n(e, 4),
    interceptions: n(e, 6),
    shotsOnTarget: e[217] ?? n(e, 13, 18),
    dribbles: n(e, 174),
  };
}
