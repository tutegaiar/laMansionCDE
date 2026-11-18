import { cacheLife, cacheTag } from "next/cache";
import { ensureSchema, hasDb, sql } from "./db";
import type { EaClubDetails, EaLeaderboardRow, EaMatch, EaMember, EaOverall } from "./ea";

/**
 * Lecturas para las páginas. Todo sale de la base (nunca de EA en vivo)
 * y queda cacheado con el tag "club"; /api/sync lo invalida al terminar.
 */

export const CACHE_TAG = "club";

export type MatchRow = {
  matchId: string;
  matchType: string;
  playedAt: string;
  goals: number;
  goalsAgainst: number;
  opponentId: string | null;
  opponentName: string | null;
};

export type PlayerMatchRow = MatchRow & {
  pos: string | null;
  rating: number | null;
  playerGoals: number;
  assists: number;
  shots: number;
  passesMade: number;
  passAttempts: number;
  tacklesMade: number;
  saves: number;
  mom: boolean;
  minutes: number;
  yellow: number;
  red: number;
  fouls: number;
};

export type ClubSummary = {
  info: EaClubDetails | null;
  overall: EaOverall | null;
  members: EaMember[];
  season: EaLeaderboardRow | null;
  lastSync: { at: string; newMatches: number; errors: string[] } | null;
};

async function safe<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  if (!hasDb()) return fallback;
  try {
    await ensureSchema();
    return await fn();
  } catch (e) {
    // Tabla todavía no creada (antes del primer sync) u otro error: no rompemos la página.
    console.error("[data]", e instanceof Error ? e.message : e);
    return fallback;
  }
}

export async function getClubSummary(): Promise<ClubSummary> {
  "use cache";
  cacheTag(CACHE_TAG);
  cacheLife("minutes");

  const empty: ClubSummary = { info: null, overall: null, members: [], season: null, lastSync: null };
  return safe(empty, async () => {
    const rows = await sql()<{ key: string; data: unknown }[]>`select key, data from snapshots`;
    const by = Object.fromEntries(rows.map((r) => [r.key, r.data]));
    return {
      info: (by.info as EaClubDetails) ?? null,
      overall: (by.overall as EaOverall) ?? null,
      members: (by.members as EaMember[]) ?? [],
      season: (by.season as EaLeaderboardRow) ?? null,
      lastSync: (by.last_sync as ClubSummary["lastSync"]) ?? null,
    };
  });
}

const matchCols = (r: Record<string, unknown>): MatchRow => ({
  matchId: String(r.match_id),
  matchType: String(r.match_type),
  playedAt: new Date(r.played_at as string).toISOString(),
  goals: Number(r.goals),
  goalsAgainst: Number(r.goals_against),
  opponentId: (r.opponent_id as string) ?? null,
  opponentName: (r.opponent_name as string) ?? null,
});

export async function getMatches(limit = 50, type?: string): Promise<MatchRow[]> {
  "use cache";
  cacheTag(CACHE_TAG);
  cacheLife("minutes");

  return safe([], async () => {
    const db = sql();
    const rows = type
      ? await db`select * from matches where match_type = ${type} order by played_at desc limit ${limit}`
      : await db`select * from matches order by played_at desc limit ${limit}`;
    return rows.map(matchCols);
  });
}

export async function getMatchCount(): Promise<number> {
  "use cache";
  cacheTag(CACHE_TAG);
  cacheLife("minutes");
  return safe(0, async () => {
    const [r] = await sql()`select count(*)::int as n from matches`;
    return r.n as number;
  });
}

export async function getMatch(id: string): Promise<{ row: MatchRow; raw: EaMatch } | null> {
  "use cache";
  cacheTag(CACHE_TAG);
  cacheLife("hours");

  return safe(null, async () => {
    const [r] = await sql()`select * from matches where match_id = ${id}`;
    if (!r) return null;
    return { row: matchCols(r), raw: r.raw as EaMatch };
  });
}

export async function getPlayerMatches(name: string, limit = 40): Promise<PlayerMatchRow[]> {
  "use cache";
  cacheTag(CACHE_TAG);
  cacheLife("minutes");

  return safe([], async () => {
    const rows = await sql()`
      select m.*, p.pos, p.rating, p.goals as p_goals, p.assists, p.shots, p.passes_made,
             p.pass_attempts, p.tackles_made, p.saves, p.mom, p.seconds_played,
             p.yellow, p.red_cards, p.fouls
      from match_players p join matches m using (match_id)
      where p.name = ${name}
      order by m.played_at desc
      limit ${limit}`;
    return rows.map((r) => ({
      ...matchCols(r),
      pos: (r.pos as string) ?? null,
      rating: r.rating == null ? null : Number(r.rating),
      playerGoals: Number(r.p_goals),
      assists: Number(r.assists),
      shots: Number(r.shots),
      passesMade: Number(r.passes_made),
      passAttempts: Number(r.pass_attempts),
      tacklesMade: Number(r.tackles_made),
      saves: Number(r.saves),
      mom: Boolean(r.mom),
      minutes: Math.round(Number(r.seconds_played) / 60),
      yellow: Number(r.yellow ?? 0),
      red: Number(r.red_cards ?? 0),
      fouls: Number(r.fouls ?? 0),
    }));
  });
}

export type NightPlayer = {
  name: string;
  games: number;
  goals: number;
  assists: number;
  mom: number;
  rating: number | null;
};

/** Totales por jugador en un conjunto de partidos (ej. los de una noche). */
export async function getPlayersInMatches(matchIds: string[]): Promise<NightPlayer[]> {
  "use cache";
  cacheTag(CACHE_TAG);
  cacheLife("minutes");

  if (!matchIds.length) return [];
  return safe([], async () => {
    const rows = await sql()`
      select name, count(*)::int as games, sum(goals)::int as goals, sum(assists)::int as assists,
             sum(case when mom then 1 else 0 end)::int as mom, avg(rating)::float as rating
      from match_players where match_id in ${sql()(matchIds)}
      group by name`;
    return rows.map((r) => ({
      name: String(r.name),
      games: Number(r.games),
      goals: Number(r.goals),
      assists: Number(r.assists),
      mom: Number(r.mom),
      rating: r.rating == null ? null : Number(r.rating),
    }));
  });
}

export type Discipline = {
  name: string;
  games: number;
  yellow: number;
  red: number;
  fouls: number;
  foulsWon: number;
  interceptions: number;
  shotsOnTarget: number;
  dribbles: number;
};

/** Tarjetas, faltas y otros eventos sumados en los partidos que guardó la página, por jugador. */
export async function getDiscipline(): Promise<Discipline[]> {
  "use cache";
  cacheTag(CACHE_TAG);
  cacheLife("minutes");
  return safe([], async () => {
    const rows = await sql()`
      select name, count(*)::int as games, sum(yellow)::int as yellow, sum(red_cards)::int as red,
             sum(fouls)::int as fouls, sum(fouls_won)::int as fouls_won, sum(interceptions)::int as interceptions,
             sum(shots_on_target)::int as sot, sum(dribbles)::int as dribbles
      from match_players group by name`;
    return rows.map((r) => ({
      name: String(r.name),
      games: Number(r.games),
      yellow: Number(r.yellow),
      red: Number(r.red),
      fouls: Number(r.fouls),
      foulsWon: Number(r.fouls_won),
      interceptions: Number(r.interceptions),
      shotsOnTarget: Number(r.sot),
      dribbles: Number(r.dribbles),
    }));
  });
}
