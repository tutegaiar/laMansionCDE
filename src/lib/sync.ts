import type postgres from "postgres";
import { club } from "./config";
import { ensureSchema, sql } from "./db";
import { ea, MATCH_TYPES, type EaMatch, type MatchType } from "./ea";

const int = (v: unknown) => {
  const n = parseInt(String(v ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
};

export type SyncResult = {
  ok: boolean;
  newMatches: number;
  errors: string[];
  durationMs: number;
};

async function saveSnapshot(key: string, data: unknown) {
  const db = sql();
  await db`
    insert into snapshots (key, data, updated_at)
    values (${key}, ${db.json(data as postgres.JSONValue)}, now())
    on conflict (key) do update set data = excluded.data, updated_at = now()`;
}

async function saveMatch(m: EaMatch, matchType: MatchType): Promise<boolean> {
  const db = sql();
  const me = m.clubs[club.clubId];
  if (!me) return false;
  const oppId = Object.keys(m.clubs).find((id) => id !== club.clubId) ?? null;
  const opp = oppId ? m.clubs[oppId] : null;

  const inserted = await db`
    insert into matches (match_id, match_type, played_at, goals, goals_against, opponent_id, opponent_name, raw)
    values (
      ${String(m.matchId)}, ${matchType}, ${new Date(m.timestamp * 1000)},
      ${int(me.goals)}, ${int(me.goalsAgainst)}, ${oppId}, ${opp?.details?.name ?? null},
      ${db.json(m as unknown as postgres.JSONValue)}
    )
    on conflict (match_id) do nothing
    returning match_id`;

  const roster = m.players[club.clubId] ?? {};
  for (const [playerId, p] of Object.entries(roster)) {
    await db`
      insert into match_players (
        match_id, player_id, name, pos, rating, goals, assists, shots, passes_made, pass_attempts,
        tackles_made, tackle_attempts, saves, mom, red_cards, seconds_played, clean_sheet
      ) values (
        ${String(m.matchId)}, ${playerId}, ${p.playername}, ${p.pos ?? null}, ${parseFloat(p.rating) || null},
        ${int(p.goals)}, ${int(p.assists)}, ${int(p.shots)}, ${int(p.passesmade)}, ${int(p.passattempts)},
        ${int(p.tacklesmade)}, ${int(p.tackleattempts)}, ${int(p.saves)}, ${p.mom === "1"},
        ${int(p.redcards)}, ${int(p.secondsPlayed)}, ${p.cleansheetsany === "1"}
      )
      on conflict (match_id, player_id) do nothing`;
  }
  return inserted.length > 0;
}

/** Trae todo de EA y lo guarda. Cada parte falla por separado sin romper el resto. */
export async function syncAll(): Promise<SyncResult> {
  const t0 = Date.now();
  const errors: string[] = [];
  let newMatches = 0;
  await ensureSchema();

  const step = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  await step("info", async () => {
    const data = await ea.info();
    const details = data[club.clubId];
    if (!details) throw new Error("respuesta sin el club");
    await saveSnapshot("info", details);
  });

  await step("overall", async () => {
    const data = await ea.overall();
    if (!Array.isArray(data) || !data[0]) throw new Error("respuesta inesperada");
    await saveSnapshot("overall", data[0]);
  });

  await step("members", async () => {
    const data = await ea.members();
    if (!Array.isArray(data?.members)) throw new Error("respuesta inesperada");
    await saveSnapshot("members", data.members);
  });

  await step("season", async () => {
    const data = await ea.season();
    const row = Array.isArray(data) ? data.find((r) => String(r.clubId) === club.clubId) : null;
    if (row) await saveSnapshot("season", row);
  });

  for (const type of MATCH_TYPES) {
    await step(`matches:${type}`, async () => {
      const list = await ea.matches(type);
      if (!Array.isArray(list)) throw new Error("respuesta inesperada");
      for (const m of list) if (await saveMatch(m, type)) newMatches++;
    });
  }

  await saveSnapshot("last_sync", {
    at: new Date().toISOString(),
    newMatches,
    errors,
  }).catch(() => {});

  return { ok: errors.length === 0, newMatches, errors, durationMs: Date.now() - t0 };
}

