import type { Metadata } from "next";
import { Suspense } from "react";
import { ComunicadoForm, DeleteComunicado, LoginForm, PaginaForm } from "@/components/admin-forms";
import { Empty } from "@/components/ui";
import { adminConfigured, isAdmin } from "@/lib/admin";
import { getComunicados, getPaginas, PAGINAS } from "@/lib/club-content";
import { fmtDate } from "@/lib/format";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Presidencia", robots: { index: false, follow: false } };

async function Panel() {
  if (!adminConfigured()) {
    return (
      <Empty>
        Falta configurar la contraseña: agregá <code>ADMIN_PASSWORD</code> en las variables de entorno de Vercel y redeployá.
      </Empty>
    );
  }
  if (!(await isAdmin())) return <LoginForm />;

  const [comunicados, paginas] = await Promise.all([getComunicados(100), getPaginas()]);

  return (
    <div className="space-y-16">
      <form action={logout} className="-mt-6">
        <button type="submit" className="min-h-11 text-base text-ink-2 underline-offset-4 hover:text-ink hover:underline">
          Cerrar sesión
        </button>
      </form>

      <section aria-labelledby="nuevo" className="border border-line bg-panel p-5 sm:p-8">
        <h2 id="nuevo" className="tv mb-6 text-5xl">
          Nuevo comunicado
        </h2>
        <ComunicadoForm />
      </section>

      <section aria-labelledby="publicados">
        <h2 id="publicados" className="tv mb-6 text-5xl">
          Publicados
        </h2>
        {comunicados.length ? (
          <ul className="flex flex-col gap-px bg-line">
            {comunicados.map((c) => (
              <li key={c.id} className="bg-panel">
                <details className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 hover:bg-panel-2">
                    <span className="min-w-0">
                      <span className="tv block truncate text-3xl">{c.titulo}</span>
                      <span className="text-sm text-ink-2">{fmtDate(c.publicadoAt)} hs</span>
                    </span>
                    <span className="tv shrink-0 text-xl text-ink-2 group-open:hidden">Editar</span>
                  </summary>
                  <div className="space-y-6 border-t border-line px-5 py-6">
                    <ComunicadoForm initial={c} />
                    <DeleteComunicado id={c.id} titulo={c.titulo} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Todavía no hay comunicados.</Empty>
        )}
      </section>

      <section aria-labelledby="secciones" className="space-y-10">
        <h2 id="secciones" className="tv text-5xl">
          Secciones del club
        </h2>
        {PAGINAS.map((p) => (
          <div key={p.key} className="border border-line bg-panel p-5 sm:p-8">
            <PaginaForm k={p.key} titulo={p.titulo} ayuda={p.ayuda} contenido={paginas[p.key]} />
          </div>
        ))}
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="tv mb-10 text-7xl sm:text-8xl">Presidencia</h1>
      <Suspense fallback={<Empty>Cargando…</Empty>}>
        <Panel />
      </Suspense>
    </div>
  );
}
