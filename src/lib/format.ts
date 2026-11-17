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

/** Nombre para mostrar: alias manual > nombre del Pro > gamertag. */
export function displayName(gamertag: string, member?: Pick<EaMember, "proName"> | null) {
  const o = playerOverride(gamertag);
  if (o.alias) return o.alias;
  if (/^[0-9a-f]{16}$/.test(gamertag) && member?.proName) return member.proName;
  return gamertag;
}

export const playerHref = (gamertag: string) => `/jugador/${encodeURIComponent(gamertag)}`;

export function divisionOf(season: { currentDivision?: string } | null) {
  if (club.divisionOverride != null) return { value: club.divisionOverride, manual: true };
  const d = Number(season?.currentDivision);
  return Number.isFinite(d) && d > 0 ? { value: d, manual: false } : null;
}
