import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CountUp } from "@/components/count-up";
import { Empty, PlayerFace, RatingChart, ResultChip, SectionHead } from "@/components/ui";
import { getClubSummary, getPlayerMatches } from "@/lib/data";
import { displayName, fmtDay, gamertagLabel, fmtTime, MATCH_TYPE_LABEL, num, posLabel, posShort, resultOf } from "@/lib/format";

async function Player({ params }: { params: Promise<{ name: string }> }) {
  const gamertag = decodeURIComponent((await params).name);
  const [{ members }, games] = await Promise.all([getClubSummary(), getPlayerMatches(gamertag)]);
  const m = members.find((x) => x.name === gamertag) ?? null;
  if (!m && !games.length) notFound();

  const name = displayName(gamertag, m);
  const rated = games.filter((g) => g.rating != null);
  const chart = [...rated].reverse().map((g) => g.rating as number);
  const recentAvg = rated.length ? rated.reduce((a, g) => a + (g.rating ?? 0), 0) / rated.length : null;
  const gk = (m?.favoritePosition ?? games[0]?.pos) === "goalkeeper";
  const gp = num(m?.gamesPlayed);

  const stats = m
    ? [
        { label: "Partidos", value: gp },
        gk ? { label: "Vallas invictas", value: num(m.cleanSheetsGK) } : { label: "Goles", value: num(m.goals) },
        { label: "Asistencias", value: num(m.assists) },
        { label: "Rating promedio", value: num(m.ratingAve), decimals: 1 },
        { label: "Veces figura", value: num(m.manOfTheMatch) },
        { label: "% de victorias", value: num(m.winRate), suffix: "%" },
        { label: "% de pase", value: num(m.passSuccessRate), suffix: "%" },
        { label: "Quites", value: num(m.tacklesMade) },
      ]
    : [];

  return (
    <>
      <section className="border-b border-line bg-panel">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative aspect-[4/3] sm:aspect-[4/5] md:aspect-auto md:min-h-[560px]" data-reveal>
            <div className="absolute inset-0 [&>*]:!h-full [&>*]:!w-full [&>span]:!text-[clamp(7rem,22vw,16rem)]">
              <PlayerFace gamertag={gamertag} name={name} size={400} shape="portrait" priority />
            </div>
          </div>
          <div className="flex flex-col justify-end gap-6 px-4 py-8 sm:px-8 md:py-12">
            <Link href="/plantel" className="inline-flex min-h-11 w-fit items-center text-base text-ink-2 hover:text-ink">
              ← Plantel
            </Link>
            <div className="flex items-baseline gap-4" data-reveal style={{ ["--i" as string]: 1 }}>
              <span className="tv text-3xl text-green-ink">{posLabel(m?.favoritePosition ?? games[0]?.pos)}</span>
              {m?.proHeight ? <span className="tv text-3xl text-ink-2">{m.proHeight} cm</span> : null}
            </div>
            <div data-reveal style={{ ["--i" as string]: 2 }}>
              <h1 className="tv bg-green px-4 pt-3 pb-2 text-[clamp(3rem,11vw,6rem)] [overflow-wrap:anywhere] text-white">{name}</h1>
              {gamertagLabel(gamertag, name) ? (
                <p className="w-fit bg-ink px-4 py-1 text-sm font-semibold text-ground">EA: {gamertag}</p>
              ) : null}
            </div>
            {m?.proOverall ? (
              <p className="flex items-baseline gap-3" data-reveal style={{ ["--i" as string]: 3 }}>
                <span className="tv text-8xl">
                  <CountUp value={num(m.proOverall)} />
                </span>
                <span className="text-lg text-ink-2">de media del Pro</span>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
        {m ? (
          <section aria-labelledby="numeros">
            <SectionHead id="numeros" title="En La Mansion" />
            <dl className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.label} className="bg-panel px-5 py-5" data-reveal style={{ ["--i" as string]: i }}>
                  <dt className="text-base text-ink-2">{s.label}</dt>
                  <dd className="tv mt-2 text-7xl">
                    <CountUp value={s.value} decimals={s.decimals ?? 0} />
                    {s.suffix}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : (
          <Empty>Este jugador ya no figura en el plantel actual; se muestran solo los partidos guardados.</Empty>
        )}

        <section aria-labelledby="rating">
          <SectionHead
            id="rating"
            title="Rating partido a partido"
            aside={recentAvg != null ? `Promedio en los guardados: ${recentAvg.toFixed(2)}` : undefined}
          />
          {chart.length >= 2 ? (
            <div className="border border-line bg-panel p-4 sm:p-6">
              <RatingChart values={chart} />
            </div>
          ) : (
            <Empty>Hacen falta al menos 2 partidos guardados para el gráfico.</Empty>
          )}
        </section>

        {games.length ? (
          <section aria-labelledby="partidos">
            <SectionHead id="partidos" title="Sus partidos" aside={`${games.length} guardados`} />
            <ol className="flex flex-col gap-px bg-line">
              {games.map((g) => (
                <li key={g.matchId}>
                  <Link
                    href={`/partidos/${g.matchId}`}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 bg-panel px-4 py-3 transition-colors hover:bg-panel-2 sm:px-6"
                  >
                    <ResultChip r={resultOf(g.goals, g.goalsAgainst)} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-3">
                        <span className="tv truncate text-3xl">
                          {g.goals}–{g.goalsAgainst} {g.opponentName ?? "Rival"}
                        </span>
                        {g.mom ? <span className="tv bg-ink px-2 pt-1 pb-0.5 text-lg text-ground">Figura</span> : null}
                      </span>
                      <span className="block text-sm text-ink-2">
                        {MATCH_TYPE_LABEL[g.matchType]} · {fmtDay(g.playedAt)} {fmtTime(g.playedAt)} · {posShort(g.pos)} ·{" "}
                        {g.playerGoals} G · {g.assists} A · {g.shots} tiros
                      </span>
                    </span>
                    <span className="tv w-20 bg-panel-2 py-1 text-center text-4xl">{g.rating?.toFixed(1) ?? "—"}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </>
  );
}

export default function PlayerPage({ params }: PageProps<"/jugador/[name]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Empty>Cargando jugador…</Empty>
        </div>
      }
    >
      <Player params={params} />
    </Suspense>
  );
}
