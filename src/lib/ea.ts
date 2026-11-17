import { readFile } from "node:fs/promises";
import path from "node:path";
import { club } from "./config";

/**
 * Cliente de la API no oficial de Clubes Pro (la misma que usa ea.com).
 * No pide key. EA (Akamai) es quisquilloso con el cliente HTTP, así que
 * mandamos headers de navegador, reintentamos y aceptamos un 403 si trae JSON.
 */

const BASE = "https://proclubs.ea.com/api/fc/";

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
  Referer: "https://www.ea.com/",
  Origin: "https://www.ea.com",
};

export type MatchType = "leagueMatch" | "playoffMatch" | "friendlyMatch";
export const MATCH_TYPES: MatchType[] = ["leagueMatch", "playoffMatch", "friendlyMatch"];

// ---------- Tipos (EA devuelve casi todo como string) ----------

export type EaKit = Record<string, string>;

export type EaClubDetails = {
  name: string;
  clubId: number;
  regionId: number;
  teamId: number;
  customKit?: EaKit;
};

export type EaMember = {
  name: string;
  proName: string;
  proPos: string;
  proHeight: string;
  proNationality: string;
  proOverall: string;
  gamesPlayed: string;
  winRate: string;
  goals: string;
  assists: string;
  cleanSheetsDef: string;
  cleanSheetsGK: string;
  shotSuccessRate: string;
  passesMade: string;
  passSuccessRate: string;
  ratingAve: string;
  tacklesMade: string;
  tackleSuccessRate: string;
  manOfTheMatch: string;
  redCards: string;
  favoritePosition: string;
  [k: string]: string;
};

export type EaOverall = Record<string, string>;

export type EaMatchClub = {
  goals: string;
  goalsAgainst: string;
  result: string;
  matchType: string;
  details?: EaClubDetails;
  [k: string]: unknown;
};

export type EaMatchPlayer = {
  playername: string;
  pos: string;
  rating: string;
  goals: string;
  assists: string;
  shots: string;
  passesmade: string;
  passattempts: string;
  tacklesmade: string;
  tackleattempts: string;
  saves: string;
  mom: string;
  redcards: string;
  secondsPlayed: string;
  cleansheetsany: string;
  [k: string]: string;
};

export type EaMatch = {
  matchId: string;
  timestamp: number;
  clubs: Record<string, EaMatchClub>;
  players: Record<string, Record<string, EaMatchPlayer>>;
  aggregate: Record<string, Record<string, number>>;
};

export type EaLeaderboardRow = {
  clubId: string;
  currentDivision?: string;
  bestDivision?: string;
  [k: string]: unknown;
};

// ---------- Fetch ----------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fromFixture<T>(name: string): Promise<T> {
  const file = path.join(process.cwd(), "fixtures", `${name}.json`);
  return JSON.parse(await readFile(file, "utf8")) as T;
}

async function eaGet<T>(endpoint: string, params: Record<string, string>, fixture: string): Promise<T> {
  if (process.env.EA_MOCK === "1") return fromFixture<T>(fixture);

  const url = BASE + endpoint + "?" + new URLSearchParams({ platform: club.platform, ...params });
  let lastError = "";

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(1500 * attempt);
    try {
      const res = await fetch(url, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(15000) });
      const text = await res.text();
      // A veces EA responde 403 pero con el JSON correcto en el body.
      try {
        const data = JSON.parse(text) as T;
        if (res.ok || typeof data === "object") return data;
      } catch {
        /* no era JSON */
      }
      lastError = `HTTP ${res.status}: ${text.slice(0, 120)}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`EA ${endpoint} falló: ${lastError}`);
}

export const ea = {
  info: () =>
    eaGet<Record<string, EaClubDetails>>("clubs/info", { clubIds: club.clubId }, "info"),
  overall: () => eaGet<EaOverall[]>("clubs/overallStats", { clubIds: club.clubId }, "overall"),
  members: () => eaGet<{ members: EaMember[] }>("members/stats", { clubId: club.clubId }, "members"),
  season: () =>
    eaGet<EaLeaderboardRow[]>("currentSeasonLeaderboard/search", { clubName: club.name }, "season"),
  matches: (matchType: MatchType) =>
    eaGet<EaMatch[]>(
      "clubs/matches",
      { clubIds: club.clubId, matchType, maxResultCount: "10" },
      `matches-${matchType}`,
    ),
};
