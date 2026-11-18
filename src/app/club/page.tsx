import type { Metadata } from "next";
import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { ComunicadoFoto, Prose } from "@/components/prose";
import { Crest, Empty, SectionHead } from "@/components/ui";
import { club } from "@/lib/config";
import { getComunicados, getPaginas } from "@/lib/club-content";
import { getClubSummary } from "@/lib/data";
import { divisionName, divisionOf, fmtDay, num } from "@/lib/format";

export const metadata: Metadata = { title: "El club" };

export default async function ClubPage() {
  const [comunicados, paginas, { overall, season }] = await Promise.all([getComunicados(30), getPaginas(), getClubSummary()]);
  // EA a veces trae la mejor división atrasada: si la actual es mejor, manda la actual.
  const actual = divisionOf(season)?.value;
  const mejor = overall ? Math.min(num(overall.bestDivision) || 99, actual ?? 99) : null;
  const [ultimo, ...resto] = comunicados;

  const logros = overall
    ? [
        { label: "Ascensos", value: num(overall.promotions) },
        { label: "Descensos", value: num(overall.relegations) },
        { label: "Partidos de playoff", value: num(overall.gamesPlayedPlayoff) },
        { label: "Partidos jugados", value: num(overall.gamesPlayed) },
      ]
    : [];

  return (
    <>
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 py-12 sm:px-6">
          <Crest size={96} />
          <div data-observe>
            <h1 className="tv wipe text-7xl sm:text-8xl">
              <span>El club</span>
            </h1>
            <p className="mt-3 text-lg">Comunicados de la presidencia, historia, palmarés y reglamento de {club.name}.</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-24 px-4 py-16 sm:px-6">
        <section aria-labelledby="comunicados">
          <SectionHead id="comunicados" title="Comunicados" />
          {ultimo ? (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-px bg-line lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
              <article className="bg-panel" data-reveal>
                {ultimo.imagen ? (
                  <ComunicadoFoto src={ultimo.imagen} alt="" className="aspect-[16/9] w-full [&_img]:object-[50%_45%]" />
                ) : null}
                <div className="p-6 sm:p-10">
                <p className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="tv bg-loss px-2 pt-1 pb-0.5 text-xl text-white">Último</span>
                  <span className="text-base text-ink-2">{fmtDay(ultimo.publicadoAt)}</span>
                </p>
                <h3 className="tv mb-6 text-5xl sm:text-6xl">
                  <Link href={`/club/comunicados/${ultimo.id}`} className="hover:underline">
                    {ultimo.titulo}
                  </Link>
                </h3>
                <Prose text={ultimo.cuerpo.split(/\n{2,}/).slice(0, 2).join("\n\n")} />
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-base font-semibold">{ultimo.firma}</p>
                  <Link
                    href={`/club/comunicados/${ultimo.id}`}
                    className="tv inline-flex min-h-12 items-center bg-green px-5 text-2xl text-white hover:bg-[color-mix(in_oklab,var(--green)_85%,white)]"
                  >
                    Leer completo
                  </Link>
                </div>
                </div>
              </article>
              <ol className="flex flex-col gap-px bg-line">
                {resto.length ? (
                  resto.map((c, i) => (
                    <li key={c.id} data-reveal style={{ ["--i" as string]: i }}>
                      <Link href={`/club/comunicados/${c.id}`} className="block bg-panel px-6 py-5 transition-colors hover:bg-panel-2">
                        <span className="block text-sm text-ink-2">{fmtDay(c.publicadoAt)}</span>
                        <span className="tv mt-1 block text-3xl">{c.titulo}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="flex-1 bg-panel px-6 py-5 text-base text-ink-2">Los comunicados anteriores van a aparecer acá.</li>
                )}
                {resto.length ? <li aria-hidden className="flex-1 bg-panel" /> : null}
              </ol>
            </div>
          ) : (
            <Empty>La presidencia todavía no publicó comunicados.</Empty>
          )}
        </section>

        <section aria-labelledby="palmares">
          <SectionHead id="palmares" title="Palmarés" />
          {overall ? (
            <dl className="mb-10 grid grid-cols-2 gap-px bg-line md:grid-cols-4">
              <div className="col-span-2 bg-panel px-5 py-5 md:col-span-4">
                <dt className="text-base text-ink-2">Mejor división alcanzada</dt>
                <dd className="tv mt-2 text-6xl">{mejor != null && mejor < 99 ? divisionName(mejor) : "—"}</dd>
              </div>
              {logros.map((l, i) => (
                <div key={l.label} className="bg-panel px-5 py-5" data-reveal style={{ ["--i" as string]: i }}>
                  <dt className="text-base text-ink-2">{l.label}</dt>
                  <dd className="tv mt-2 text-7xl">
                    <CountUp value={l.value} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {paginas.palmares ? <Prose text={paginas.palmares} /> : null}
          <p className="mt-4 text-sm text-ink-2">Los números salen de EA; los logros escritos los carga la presidencia.</p>
        </section>

        <section aria-labelledby="historia" className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <h2 id="historia" className="tv text-6xl" data-observe>
            <span className="wipe">
              <span>Historia</span>
            </span>
          </h2>
          {paginas.historia ? <Prose text={paginas.historia} /> : <Empty>La historia del club todavía no está escrita.</Empty>}
        </section>

        <section aria-labelledby="reglamento" className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <h2 id="reglamento" className="tv text-6xl" data-observe>
            <span className="wipe">
              <span>Reglamento interno</span>
            </span>
          </h2>
          {paginas.reglamento ? <Prose text={paginas.reglamento} /> : <Empty>El reglamento todavía no está cargado.</Empty>}
        </section>
      </div>
    </>
  );
}
