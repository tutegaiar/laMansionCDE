import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Sesión de la presidencia: una contraseña (ADMIN_PASSWORD en Vercel) y una cookie firmada.
 * Si se cambia la contraseña, todas las sesiones abiertas se cierran solas.
 */

export const ADMIN_COOKIE = "lm_admin";

function token(): string | null {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return null;
  return createHmac("sha256", pass).update("la-mansion-admin-v1").digest("hex");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function passwordOk(input: string) {
  const pass = process.env.ADMIN_PASSWORD;
  return Boolean(pass) && same(input, pass as string);
}

export function sessionToken() {
  return token();
}

export async function isAdmin(): Promise<boolean> {
  const t = token();
  if (!t) return false;
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(c) && same(c as string, t);
}
