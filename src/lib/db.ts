import postgres from "postgres";

/**
 * Conexión a Postgres (Neon). Usa DATABASE_URL, que Vercel carga solo
 * cuando agregás Neon desde el Marketplace.
 */

declare global {
  var __sql: postgres.Sql | undefined;
}

export function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

export function sql(): postgres.Sql {
  if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL");
  if (!globalThis.__sql) {
    globalThis.__sql = postgres(process.env.DATABASE_URL, {
      // Neon con pooler (PgBouncer) no soporta prepared statements.
      prepare: false,
      max: 3,
      idle_timeout: 20,
      ssl: process.env.DATABASE_URL.includes("localhost") ? false : "require",
    });
  }
  return globalThis.__sql;
}

let schemaReady: Promise<void> | null = null;

/** Crea las tablas si no existen. Idempotente. */
export function ensureSchema() {
  schemaReady ??= (async () => {
    const db = sql();
    await db`
      create table if not exists snapshots (
        key text primary key,
        data jsonb not null,
        updated_at timestamptz not null default now()
      )`;
    await db`
      create table if not exists matches (
        match_id text primary key,
        match_type text not null,
        played_at timestamptz not null,
        goals int not null,
        goals_against int not null,
        opponent_id text,
        opponent_name text,
        raw jsonb not null
      )`;
    await db`
      create table if not exists match_players (
        match_id text not null references matches(match_id) on delete cascade,
        player_id text not null,
        name text not null,
        pos text,
        rating numeric(4,2),
        goals int not null default 0,
        assists int not null default 0,
        shots int not null default 0,
        passes_made int not null default 0,
        pass_attempts int not null default 0,
        tackles_made int not null default 0,
        tackle_attempts int not null default 0,
        saves int not null default 0,
        mom boolean not null default false,
        red_cards int not null default 0,
        seconds_played int not null default 0,
        clean_sheet boolean not null default false,
        primary key (match_id, player_id)
      )`;
    await db`create index if not exists match_players_name_idx on match_players (name)`;
    await db`create index if not exists matches_played_at_idx on matches (played_at desc)`;
  })().catch((e) => {
    schemaReady = null;
    throw e;
  });
  return schemaReady;
}
