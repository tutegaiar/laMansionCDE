import postgres from "postgres";
import { extraStats } from "./events";
import { SEED_COMUNICADOS, SEED_REGLAMENTO } from "./seed";

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
    await db`
      create table if not exists paginas (
        key text primary key,
        contenido text not null,
        updated_at timestamptz not null default now()
      )`;
    await db`create index if not exists match_players_name_idx on match_players (name)`;
    // Tarjetas, faltas y otros eventos (decodificados de match_event_aggregate).
    for (const col of ["yellow", "fouls", "fouls_won", "interceptions", "shots_on_target", "dribbles"]) {
      await db.unsafe(`alter table match_players add column if not exists ${col} int not null default 0`);
    }
    // Completa los partidos que se guardaron antes de tener estas columnas (una sola vez).
    const backfill = await db`
      insert into paginas (key, contenido) values ('migr:events-v1', 'ok')
      on conflict (key) do nothing returning key`.catch(() => []);
    if (backfill.length) {
      const rows = await db`select match_id, raw from matches`;
      for (const r of rows) {
        const raw = r.raw as { players?: Record<string, Record<string, Record<string, unknown>>> };
        for (const roster of Object.values(raw.players ?? {})) {
          for (const [pid, p] of Object.entries(roster)) {
            const x = extraStats(p);
            await db`
              update match_players set yellow = ${x.yellow}, fouls = ${x.fouls}, fouls_won = ${x.foulsWon},
                interceptions = ${x.interceptions}, shots_on_target = ${x.shotsOnTarget}, dribbles = ${x.dribbles}
              where match_id = ${String(r.match_id)} and player_id = ${pid}`;
          }
        }
      }
    }
    await db`
      create table if not exists comunicados (
        id serial primary key,
        titulo text not null,
        cuerpo text not null,
        firma text not null default 'La Presidencia',
        publicado_at timestamptz not null default now(),
        editado_at timestamptz
      )`;
    await db`alter table comunicados add column if not exists imagen text`;
    await db`
      create table if not exists paginas (
        key text primary key,
        contenido text not null,
        updated_at timestamptz not null default now()
      )`;
    // Reglamento inicial: solo si todavía no hay uno escrito (nunca pisa lo cargado desde /admin).
    await db`insert into paginas (key, contenido) values ('reglamento', ${SEED_REGLAMENTO}) on conflict (key) do nothing`;
    // Comunicados iniciales: una sola vez por base (si se borran, no vuelven).
    for (const c of SEED_COMUNICADOS) {
      const fresh = await db`
        insert into paginas (key, contenido) values (${c.key}, 'cargado')
        on conflict (key) do nothing returning key`;
      if (fresh.length) {
        await db`insert into comunicados (titulo, cuerpo, firma, imagen) values (${c.titulo}, ${c.cuerpo}, ${c.firma}, ${c.imagen})`;
      }
    }
    await db`create index if not exists matches_played_at_idx on matches (played_at desc)`;
  })().catch((e) => {
    schemaReady = null;
    throw e;
  });
  return schemaReady;
}
