import { cacheLife, cacheTag } from "next/cache";
import { ensureSchema, hasDb, sql } from "./db";

/** Contenido del club que escribe la presidencia desde /admin. */

export const CONTENT_TAG = "contenido";

export type Comunicado = {
  id: number;
  titulo: string;
  cuerpo: string;
  firma: string;
  publicadoAt: string;
  editadoAt: string | null;
};

export type PaginaKey = "historia" | "palmares" | "reglamento";
export const PAGINAS: { key: PaginaKey; titulo: string; ayuda: string }[] = [
  { key: "historia", titulo: "Historia", ayuda: "Cómo nació el club, el nombre, el estadio, momentos que marcaron." },
  { key: "palmares", titulo: "Palmarés", ayuda: "Un logro por línea, ej.: - Temporada 3: ascenso a Primera" },
  { key: "reglamento", titulo: "Reglamento interno", ayuda: "Horarios de juego, convocatoria, sanciones." },
];

const toComunicado = (r: Record<string, unknown>): Comunicado => ({
  id: Number(r.id),
  titulo: String(r.titulo),
  cuerpo: String(r.cuerpo),
  firma: String(r.firma),
  publicadoAt: new Date(r.publicado_at as string).toISOString(),
  editadoAt: r.editado_at ? new Date(r.editado_at as string).toISOString() : null,
});

async function safe<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  if (!hasDb()) return fallback;
  try {
    await ensureSchema();
    return await fn();
  } catch (e) {
    console.error("[contenido]", e instanceof Error ? e.message : e);
    return fallback;
  }
}

export async function getComunicados(limit = 50): Promise<Comunicado[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return safe([], async () => {
    const rows = await sql()`select * from comunicados order by publicado_at desc limit ${limit}`;
    return rows.map(toComunicado);
  });
}

export async function getComunicado(id: number): Promise<Comunicado | null> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  if (!Number.isInteger(id)) return null;
  return safe(null, async () => {
    const [r] = await sql()`select * from comunicados where id = ${id}`;
    return r ? toComunicado(r) : null;
  });
}

export async function getPaginas(): Promise<Record<PaginaKey, string>> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const empty = { historia: "", palmares: "", reglamento: "" };
  return safe(empty, async () => {
    const rows = await sql()`select key, contenido from paginas`;
    const out = { ...empty };
    for (const r of rows) if (r.key in out) out[r.key as PaginaKey] = String(r.contenido);
    return out;
  });
}
