import { club, playerOverride } from "./config";
import type { EaClubDetails, EaMember } from "./ea";

/** EA guarda los colores como entero decimal (ej. 1339431 → #147027). */
export function eaColor(v: string | number | undefined, fallback: string): string {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return "#" + n.toString(16).padStart(6, "0");
}

export function kitColors(info: EaClubDetails | null) {
  const k = info?.customKit ?? {};
  return {
    primary: eaColor(k.kitColor1, "#0b0d10"),
    secondary: eaColor(k.kitColor2, "#147027"),
    tertiary: eaColor(k.kitColor4, "#d9d9d9"),
    away: eaColor(k.kitAColor1, "#f2f2f2"),
    third: eaColor(k.kitThrdColor1, "#c02036"),
  };
}

export type Result = "W" | "D" | "L";
export function resultOf(goals: number, against: number): Result {
  return goals > against ? "W" : goals < against ? "L" : "D";
}
export const resultLabel: Record<Result, string> = { W: "G", D: "E", L: "P" };

const POS: Record<string, string> = {
  goalkeeper: "Arquero",
  defender: "Defensor",
  midfielder: "Mediocampista",
  forward: "Delantero",
};
export const posLabel = (p?: string | null) => (p ? (POS[p] ?? p) : "—");
export const posShort = (p?: string | null) =>
  ({ goalkeeper: "ARQ", defender: "DEF", midfielder: "MED", forward: "DEL" })[p ?? ""] ?? "—";

export const MATCH_TYPE_LABEL: Record<string, string> = {
  leagueMatch: "Liga",
  playoffMatch: "Playoff",
  friendlyMatch: "Amistoso",
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
/** Fecha en hora de Argentina (UTC-3, sin horario de verano), ej. "17 nov, 15:38". */
export function fmtDate(iso: string) {
  const d = new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${hh}:${mm}`;
}

export const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Nombre grande: el del jugador en el club (alias en config > nombre del Pro en EA > gamertag).
 * El gamertag de EA va aparte, chiquito (ver `gamertagLabel`).
 */
export function displayName(gamertag: string, member?: Pick<EaMember, "proName"> | null) {
  const o = playerOverride(gamertag);
  if (o.alias) return o.alias;
  if (member?.proName?.trim()) return member.proName.trim();
  return gamertag;
}

/** Gamertag para mostrar chiquito; null si es un hash de EA (no dice nada) o igual al nombre. */
export function gamertagLabel(gamertag: string, name: string): string | null {
  if (/^[0-9a-f]{16}$/.test(gamertag)) return null;
  return gamertag.toLowerCase() === name.toLowerCase() ? null : gamertag;
}

export const playerHref = (gamertag: string) => `/jugador/${encodeURIComponent(gamertag)}`;

/** División: 0 = Elite, 1 = Primera, … */
export function divisionOf(season: { currentDivision?: string } | null) {
  if (club.divisionOverride != null) return { value: club.divisionOverride, manual: true };
  const raw = season?.currentDivision;
  const d = Number(raw);
  return raw != null && raw !== "" && Number.isFinite(d) && d >= 0 ? { value: d, manual: false } : null;
}

const DIV_NAMES = ["Elite", "Primera División", "Segunda División", "Tercera División", "Cuarta División", "Quinta División", "Sexta División", "Séptima División", "Octava División", "Novena División", "Décima División"];
export const divisionName = (d: number) => DIV_NAMES[d] ?? `División ${d}`;

/** Medalla por nivel: Elite y Primera oro, 2ª y 3ª plata, 4ª y 5ª bronce, el resto el verde del club. */
export function divisionTier(d: number): "gold" | "silver" | "bronze" | "club" {
  if (d <= 1) return "gold";
  if (d <= 3) return "silver";
  if (d <= 5) return "bronze";
  return "club";
}

const toAr = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
/** "22:56" en hora argentina. */
export const fmtTime = (iso: string) => {
  const d = toAr(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};
const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
/** "domingo 16 nov" en hora argentina. */
export const fmtDay = (iso: string) => {
  const d = toAr(iso);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};
