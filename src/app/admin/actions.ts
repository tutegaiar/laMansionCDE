"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdmin, passwordOk, sessionToken } from "@/lib/admin";
import { CONTENT_TAG, PAGINAS, type PaginaKey } from "@/lib/club-content";
import { ensureSchema, sql } from "@/lib/db";

export type FormState = { ok?: string; error?: string };

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function login(_: FormState, form: FormData): Promise<FormState> {
  if (!passwordOk(text(form, "password"))) {
    await new Promise((r) => setTimeout(r, 900)); // frena intentos a lo bruto
    return { error: "Contraseña incorrecta." };
  }
  (await cookies()).set(ADMIN_COOKIE, sessionToken() as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: "Adentro." };
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
}

async function guard(): Promise<FormState | null> {
  if (!(await isAdmin())) return { error: "La sesión se cerró. Volvé a entrar." };
  await ensureSchema();
  return null;
}

export async function saveComunicado(_: FormState, form: FormData): Promise<FormState> {
  const g = await guard();
  if (g) return g;
  const id = Number(form.get("id") || 0);
  const titulo = text(form, "titulo");
  const cuerpo = text(form, "cuerpo");
  const firma = text(form, "firma") || "La Presidencia";
  if (!titulo) return { error: "Falta el título." };
  if (titulo.length > 140) return { error: "El título es muy largo (máximo 140 caracteres)." };
  if (!cuerpo) return { error: "Falta el texto del comunicado." };
  if (cuerpo.length > 8000) return { error: "El texto es muy largo (máximo 8000 caracteres)." };

  const db = sql();
  if (id) {
    await db`update comunicados set titulo = ${titulo}, cuerpo = ${cuerpo}, firma = ${firma}, editado_at = now() where id = ${id}`;
  } else {
    await db`insert into comunicados (titulo, cuerpo, firma) values (${titulo}, ${cuerpo}, ${firma})`;
  }
  updateTag(CONTENT_TAG);
  return { ok: id ? "Comunicado actualizado." : "Comunicado publicado." };
}

export async function deleteComunicado(_: FormState, form: FormData): Promise<FormState> {
  const g = await guard();
  if (g) return g;
  const id = Number(form.get("id") || 0);
  if (!id) return { error: "Comunicado inválido." };
  await sql()`delete from comunicados where id = ${id}`;
  updateTag(CONTENT_TAG);
  return { ok: "Comunicado borrado." };
}

export async function savePagina(_: FormState, form: FormData): Promise<FormState> {
  const g = await guard();
  if (g) return g;
  const key = text(form, "key") as PaginaKey;
  if (!PAGINAS.some((p) => p.key === key)) return { error: "Sección inválida." };
  const contenido = text(form, "contenido");
  if (contenido.length > 20000) return { error: "El texto es muy largo." };
  await sql()`
    insert into paginas (key, contenido, updated_at) values (${key}, ${contenido}, now())
    on conflict (key) do update set contenido = excluded.contenido, updated_at = now()`;
  updateTag(CONTENT_TAG);
  return { ok: "Guardado." };
}
