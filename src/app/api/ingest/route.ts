import { revalidateTag } from "next/cache";
import { authorized } from "@/lib/auth";
import { CACHE_TAG } from "@/lib/data";
import { hasDb } from "@/lib/db";
import { payloadSource, syncFrom, type EaPayload } from "@/lib/sync";

/**
 * Recibe las respuestas crudas de EA desde afuera y las guarda.
 * EA bloquea las IPs de Vercel, así que el fetch lo hace scripts/ea-sync.mjs
 * desde una compu con IP común y le manda acá el resultado:
 *
 *   POST /api/ingest
 *   Authorization: Bearer <CRON_SECRET>
 *   { info, overall, members, season, matches: { leagueMatch, playoffMatch, friendlyMatch } }
 *
 * También acepta pedidos desde el navegador estando en proclubs.ea.com (carga manual).
 */

export const maxDuration = 60;

const ALLOWED_ORIGIN = "https://proclubs.ea.com";

function cors(req: Request): Record<string, string> {
  if (req.headers.get("origin") !== ALLOWED_ORIGIN) return {};
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req) });
}

export async function POST(req: Request) {
  const headers = cors(req);
  if (!authorized(req)) return Response.json({ error: "no autorizado" }, { status: 401, headers });
  if (!hasDb()) return Response.json({ error: "falta DATABASE_URL" }, { status: 500, headers });

  let payload: EaPayload;
  try {
    payload = (await req.json()) as EaPayload;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400, headers });
  }

  const result = await syncFrom(payloadSource(payload));
  revalidateTag(CACHE_TAG, "max");
  return Response.json(result, { status: result.ok ? 200 : 207, headers });
}
