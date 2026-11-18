import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Crest, Empty, PlayerFace } from "@/components/ui";
import { club } from "@/lib/config";
import { getClubSummary, getMatch } from "@/lib/data";
import type { EaMatchPlayer } from "@/lib/ea";
import { displayName, fmtDay, fmtTime, MATCH_TYPE_LABEL, num, playerHref, posShort, resultOf } from "@/lib/format";

const POS_ORDER: Record<string, number> = { goalkeeper: 0, defender: 1, midfielder: 2, forward: 3 };
const RESULT_WORD = { W: "Victoria", D: "Empate", L: "Derrota" } as const;

function teamTotals(players: EaMatchPlayer[]) {
  const s = (k: keyof EaMatchPlayer) => players.reduce((a, p) => a + num(p[k]), 0);
  const pa = s("passattempts");
  return {
    shots: s("shots"),
    passes: s("passesmade"),
    passPct: pa ? Math.round((s("passesmade") / pa) * 100) : 0,
    tackles: s("tacklesmade"),
    saves: s("saves"),
  };
}

/** Barra comparativa de dos lados, como en la gráfica de TV. */
function Compare({ label, a, b, suffix = "", i }: { label: string; a: number; b: number; suffix?: string; i: number }) {
  const total = a + b || 1;
  return (
    <div data-reveal style={{ ["--i" as string]: i }}>
      <div className="mb-1.5 grid grid-cols-[4rem_1fr_4rem] items-end">
        <span className={`tv text-4xl ${a > b ? "text-green-ink" : ""}`}>
          {a}
          {suffix}
        </span>
        <span className="text-center text-base text-ink-2">{label}</span>
        <span className={`tv text-right text-4xl ${b > a ? "" : "text-ink-2"}`}>
          {b}
          {suffix}
        </span>
      </div>
      <div className="flex h-2 gap-1">
        <div className="flex flex-1 justify-end bg-panel-2">
          <div className="h-full origin-right bg-green motion-safe:animate-[progress_900ms_var(--ease-out)_both]" style={{ width: `${(a / total) * 100}%` }} />
        </div>
        <div className="flex-1 bg-panel-2">
          <div className="h-full origin-left bg-ink-2 motion-safe:animate-[progress_900ms_var(--ease-out)_both]" style={{ width: `${(b / total) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

async function MatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, { members }] = await Promise.all([getMatch(id), getClubSummary()]);
  if (!data) notFound();

  const { row, raw } = data;
  const r = resultOf(row.goals, row.goalsAgainst);
  const ours = Object.values(raw.players[club.clubId] ?? {}).sort(
    (a, b) => (POS_ORDER[a.pos] ?? 9) - (POS_ORDER[b.pos] ?? 9) || num(b.rating) - num(a.rating),
  );
  const theirs = row.opponentId ? Object.values(raw.players[row.opponentId] ?? {}) : [];
  const t1 = teamTotals(ours),
    t2 = teamTotals(theirs);
  const memberOf = (tag: string) => members.find((m) => m.name === tag);
  const best = [...ours].sort((a, b) => num(b.rating) - num(a.rating))[0];

  return (
    <>
      {/* Marcador */}
      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6">
          <Link href="/partidos" className="inline-flex min-h-11 items-center text-base text-ink-2 hover:text-ink">
            ← Todos los partidos
          </Link>
          <p className="mt-4 text-center text-base text-ink-2" data-reveal>
            {MATCH_TYPE_LABEL[row.matchType] ?? row.matchType} · {fmtDay(row.playedAt)} · {fmtTime(row.playedAt)} hs
          </p>
          <h1 className="sr-only">
            {club.name} {row.goals} - {row.goalsAgainst} {row.opponentName ?? "Rival"}
          </h1>
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
            <div className="flex flex-col items-center gap-3 text-center" data-reveal>
              <Crest size={72} />
              <span className="tv text-3xl sm:text-5xl">La Mansion</span>
            </div>
            <div className="flex flex-col items-center" data-reveal style={{ ["--i" as string]: 1 }}>
              <div className="tv flex items-center text-[clamp(5rem,16vw,10rem)]">
                <span className={r === "L" ? "text-ink-2" : ""}>{row.goals}</span>
                <span className="px-2 text-ink-2 sm:px-4">–</span>
                <span className={r === "W" ? "text-ink-2" : ""}>{row.goalsAgainst}</span>
              </div>
              <span
                className={`tv mt-2 px-3 pt-1.5 pb-1 text-2xl ${
                  r === "W" ? "bg-green text-white" : r === "L" ? "bg-loss text-white" : "bg-draw text-black"
                }`}
              >
                {RESULT_WORD[r]}
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 text-center" data-reveal style={{ ["--i" as string]: 2 }}>
              <span className="tv grid h-[83px] w-[72px] place-items-center border-2 border-line text-4xl text-ink-2">
                {(row.opponentName ?? "?").slice(0, 2).toUpperCase()}
              </span>
              <span className="tv text-3xl sm:text-5xl">{row.opponentName ?? "Rival"}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6">
        {theirs.length ? (
          <section aria-labelledby="numeros" className="mx-auto max-w-2xl">
            <h2 id="numeros" className="tv mb-6 text-center text-5xl">
              Los números
            </h2>
            <div className="space-y-6">
              <Compare i={0} label="Tiros" a={t1.shots} b={t2.shots} />
              <Compare i={1} label="Pases completados" a={t1.passes} b={t2.passes} />
              <Compare i={2} label="Efectividad de pase" a={t1.passPct} b={t2.passPct} suffix="%" />
              <Compare i={3} label="Quites" a={t1.tackles} b={t2.tackles} />
              <Compare i={4} label="Atajadas" a={t1.saves} b={t2.saves} />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="jugadores">
          <h2 id="jugadores" className="tv mb-6 text-5xl">
            La Mansion en cancha
          </h2>
          <ol className="flex flex-col gap-px bg-line">
            {ours.map((p, i) => {
              const name = displayName(p.playername, memberOf(p.playername));
              const top = best && p.playername === best.playername;
              return (
                <li key={p.playername} data-reveal style={{ ["--i" as string]: i }}>
                  <Link
                    href={playerHref(p.playername)}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 bg-panel py-2 pr-4 pl-2 transition-colors hover:bg-panel-2 sm:pr-6"
                  >
                    <PlayerFace gamertag={p.playername} name={name} size={52} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-3">
                        <span className="tv truncate text-3xl">{name}</span>
                        {p.mom === "1" ? <span className="tv bg-ink px-2 pt-1 pb-0.5 text-lg text-ground">Figura</span> : null}
                      </span>
                      <span className="block text-sm text-ink-2">
                        {posShort(p.pos)} · {num(p.goals)} G · {num(p.assists)} A · {p.shots} tiros · pases {p.passesmade}/
                        {p.passattempts} · quites {p.tacklesmade}/{p.tackleattempts}
                        {num(p.saves) ? ` · ${p.saves} atajadas` : ""}
                      </span>
                    </span>
                    <span className={`tv w-20 py-1 text-center text-4xl ${top ? "bg-green text-white" : "bg-panel-2"}`}>
                      {num(p.rating).toFixed(1)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
}

export default function MatchPage({ params }: PageProps<"/partidos/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Empty>Cargando partido…</Empty>
        </div>
      }
    >
      <MatchDetail params={params} />
    </Suspense>
  );
}
