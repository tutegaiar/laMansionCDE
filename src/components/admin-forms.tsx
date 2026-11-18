"use client";

import { useActionState } from "react";
import {
  deleteComunicado,
  login,
  saveComunicado,
  savePagina,
  type FormState,
} from "@/app/admin/actions";

const input =
  "w-full border border-line bg-ground px-4 py-3 text-lg text-ink placeholder:text-ink-2/70 focus:border-green-ink focus:outline-none";
const label = "mb-2 block text-base font-semibold";
const button =
  "tv inline-flex min-h-12 items-center bg-green px-6 text-2xl text-white transition-colors hover:bg-[color-mix(in_oklab,var(--green)_85%,white)] disabled:opacity-60";

function Status({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p role="alert" className="text-base text-loss-ink">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="text-base text-green-ink">
        {state.ok}
      </p>
    );
  return null;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="max-w-md space-y-5">
      <div>
        <label htmlFor="password" className={label}>
          Contraseña de la presidencia
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={button}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function ComunicadoForm({
  initial,
}: {
  initial?: { id: number; titulo: string; cuerpo: string; firma: string; imagen: string | null };
}) {
  const [state, action, pending] = useActionState(saveComunicado, {});
  const pre = initial ? `c${initial.id}` : "nuevo";
  return (
    <form action={action} className="space-y-5">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div>
        <label htmlFor={`${pre}-titulo`} className={label}>
          Título
        </label>
        <input id={`${pre}-titulo`} name="titulo" required maxLength={140} defaultValue={initial?.titulo} className={input} />
      </div>
      <div>
        <label htmlFor={`${pre}-cuerpo`} className={label}>
          Texto
        </label>
        <p id={`${pre}-ayuda`} className="mb-2 text-sm text-ink-2">
          Línea en blanco para separar párrafos. &quot;## &quot; al principio para un subtítulo, &quot;- &quot; para listas,
          **así** para negrita.
        </p>
        <textarea
          id={`${pre}-cuerpo`}
          name="cuerpo"
          required
          rows={10}
          maxLength={8000}
          aria-describedby={`${pre}-ayuda`}
          defaultValue={initial?.cuerpo}
          className={input}
        />
      </div>
      <div>
        <label htmlFor={`${pre}-firma`} className={label}>
          Firma
        </label>
        <input id={`${pre}-firma`} name="firma" defaultValue={initial?.firma ?? "La Presidencia"} className={input} />
      </div>
      <div>
        <label htmlFor={`${pre}-imagen`} className={label}>
          Foto (opcional)
        </label>
        <p id={`${pre}-imagen-ayuda`} className="mb-2 text-sm text-ink-2">
          Link a una imagen (https://…) o una ruta del sitio, ej. /comunicados/foto.webp
        </p>
        <input
          id={`${pre}-imagen`}
          name="imagen"
          aria-describedby={`${pre}-imagen-ayuda`}
          defaultValue={initial?.imagen ?? ""}
          className={input}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={button}>
          {pending ? "Guardando…" : initial ? "Guardar cambios" : "Publicar comunicado"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function DeleteComunicado({ id, titulo }: { id: number; titulo: string }) {
  const [state, action, pending] = useActionState(deleteComunicado, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`¿Borrar "${titulo}"? No se puede deshacer.`)) e.preventDefault();
      }}
      className="flex items-center gap-4"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="min-h-11 border border-loss px-4 text-base text-loss-ink hover:bg-loss hover:text-white">
        {pending ? "Borrando…" : "Borrar"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function PaginaForm({ k, titulo, ayuda, contenido }: { k: string; titulo: string; ayuda: string; contenido: string }) {
  const [state, action, pending] = useActionState(savePagina, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="key" value={k} />
      <div>
        <label htmlFor={`p-${k}`} className={label}>
          {titulo}
        </label>
        <p id={`p-${k}-ayuda`} className="mb-2 text-sm text-ink-2">
          {ayuda}
        </p>
        <textarea
          id={`p-${k}`}
          name="contenido"
          rows={8}
          aria-describedby={`p-${k}-ayuda`}
          defaultValue={contenido}
          className={input}
        />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={button}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}
