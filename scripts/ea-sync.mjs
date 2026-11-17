#!/usr/bin/env node
/**
 * Sync externo: trae los datos del club desde EA y se los manda a la página.
 *
 * Por qué existe: EA (Akamai) bloquea las IPs de Vercel, pero deja pasar
 * IPs comunes (casa, oficina). Este script corre en cualquier compu prendida
 * con Node 18 o más nuevo, sin instalar nada.
 *
 * Uso:
 *   SITE_URL=https://la-mansion-cde.vercel.app CRON_SECRET=xxx node scripts/ea-sync.mjs
 *
 * Programarlo cada 30 min con cron (Linux) o el Programador de tareas (Windows). Ver README.
 */

const SITE_URL = (process.env.SITE_URL ?? "").replace(/\/$/, "");
const SECRET = process.env.CRON_SECRET ?? "";
const CLUB_ID = process.env.CLUB_ID ?? "480112";
const CLUB_NAME = process.env.CLUB_NAME ?? "La Mansion CDE";
const PLATFORM = process.env.PLATFORM ?? "common-gen5";

if (!SITE_URL || !SECRET) {
  console.error("Faltan SITE_URL y/o CRON_SECRET");
  process.exit(1);
}

const BASE = "https://proclubs.ea.com/api/fc/";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
  Referer: "https://www.ea.com/",
  Origin: "https://www.ea.com",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ea(endpoint, params) {
  const url = BASE + endpoint + "?" + new URLSearchParams({ platform: PLATFORM, ...params });
  let last = "";
  for (let i = 0; i < 3; i++) {
    if (i) await sleep(2000 * i);
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
      const text = await res.text();
      try {
        return JSON.parse(text); // a veces viene 403 con JSON válido
      } catch {
        last = `HTTP ${res.status}: ${text.slice(0, 80).replace(/\s+/g, " ")}`;
      }
    } catch (e) {
      last = e.message;
    }
  }
  console.warn(`  ✗ ${endpoint}: ${last}`);
  return undefined; // esa parte no se manda; el resto sí
}

const t0 = Date.now();
const payload = {
  info: await ea("clubs/info", { clubIds: CLUB_ID }),
  overall: await ea("clubs/overallStats", { clubIds: CLUB_ID }),
  members: await ea("members/stats", { clubId: CLUB_ID }),
  season: await ea("currentSeasonLeaderboard/search", { clubName: CLUB_NAME }),
  matches: {},
};
for (const type of ["leagueMatch", "playoffMatch", "friendlyMatch"]) {
  payload.matches[type] = await ea("clubs/matches", { clubIds: CLUB_ID, matchType: type, maxResultCount: "10" });
}

const got = [payload.info, payload.overall, payload.members, ...Object.values(payload.matches)].filter(Boolean);
if (!got.length) {
  console.error("EA no devolvió nada (¿bloqueo de IP o EA caído?). No se envía nada.");
  process.exit(1);
}

const res = await fetch(`${SITE_URL}/api/ingest`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${SECRET}` },
  body: JSON.stringify(payload),
});
const out = await res.text();
console.log(`[${new Date().toLocaleString("es-AR")}] HTTP ${res.status} en ${Date.now() - t0} ms → ${out}`);
process.exit(res.ok ? 0 : 1);
