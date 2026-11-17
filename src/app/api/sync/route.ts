import { revalidateTag } from "next/cache";
import { authorized } from "@/lib/auth";
import { CACHE_TAG } from "@/lib/data";
import { hasDb } from "@/lib/db";
import { syncAll } from "@/lib/sync";

/**
 * Trae los datos de EA y los guarda en la base.
 * Lo llama cron-job.org cada 30 min con el header
 *   Authorization: Bearer <CRON_SECRET>
 * (también acepta ?key=<CRON_SECRET> por si tu cron no permite headers).
 */

export const maxDuration = 60;

async function handle(req: Request) {
  if (!authorized(req)) return Response.json({ error: "no autorizado" }, { status: 401 });
  if (!hasDb()) return Response.json({ error: "falta DATABASE_URL" }, { status: 500 });

  const result = await syncAll();
  revalidateTag(CACHE_TAG, "max");
  return Response.json(result, { status: result.ok ? 200 : 207 });
}

export const GET = handle;
export const POST = handle;
