import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Avatar, Empty, RatingChart, ResultPill, SectionTitle, Stat } from "@/components/ui";
import { playerOverride } from "@/lib/config";
import { getClubSummary, getPlayerMatches } from "@/lib/data";
import { displayName, fmtDate, MATCH_TYPE_LABEL, num, posLabel, posShort, resultOf } from "@/lib/format";

async function Player({ params }: { params: Promise<{ name: string }> }) {
  const gamertag = decodeURIComponent((await params).name);
  const [{ members }, games] = await Promise.all([getClubSummary(), getPlayerMatches(gamertag)]);
  const m = members.find((x) => x.name === gamertag) ?? null;
  if (!m && !games.length) notFound();

  const name = displayName(gamertag, m);
  const photo = playerOverride(gamertag).photo;
  const rated = games.filter((g) => g.rating != null);
  const chart = [...rated].reverse().map((g) => g.rating as number);
  const recentAvg = rated.length ? rated.reduce((a, g) => a + (g.rating ?? 0), 0) / rated.length : null;
  const gk = (m?.favoritePosition ?? games[0]?.pos) === "goalkeeper";

  return (
    <div className="space-y-8">
      <Link href="/plantel" className="text-sm text-muted hover:text-accent">
        ← Plantel
      </Link>

      <section className="card stripes flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            width={160}
            height={200}
            className="h-[200px] w-[160px] rounded-xl object-cover ring-1 ring-line"
          />
        ) : (
          <Avatar gamertag={gamertag} name={name} size={128} />
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="display text-5xl font-bold sm:text-6xl">{name}</h1>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
            {name !== gamertag ? <span>@{gamertag}</span> : null}
            <span>{posLabel(m?.favoritePosition ?? games[0]?.pos)}</span>
            {m?.proHeight ? <span>{m.proHeight} cm</span> : null}
          </div>
        </div>
        {m?.proOverall ? (
          <div className="text-center">
            <div className="display text-7xl font-bold text-accent">{m.proOverall}</div>
            <div className="text-xs uppercase tracking-wider text-muted">Media</div>
          </div>
        ) : null}
      </section>

      {m ? (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Partidos" value={m.gamesPlayed} hint={`${m.winRate}% ganados`} />
          {gk ? (
            <Stat label="Vallas invictas" value={m.cleanSheetsGK} accent />
          ) : (
            <Stat
              label="Goles"
              value={m.goals}
              accent
              hint={`${num(m.gamesPlayed) ? (num(m.goals) / num(m.gamesPlayed)).toFixed(2) : 0} por partido`}
            />
          )}
          <Stat label="Asistencias" value={m.assists} />
          <Stat label="Rating promedio" value={num(m.ratingAve).toFixed(1)} hint={`${m.manOfTheMatch} veces figura`} />
          <Stat label="Pases" value={m.passesMade} hint={`${m.passSuccessRate}% de efectividad`} />
          <Stat label="Quites" value={m.tacklesMade} hint={`${m.tackleSuccessRate}% de efectividad`} />
          <Stat label="Efectividad de tiro" value={`${m.shotSuccessRate}%`} />
          <Stat label="Rojas" value={m.redCards} />
        </section>
      ) : (
        <Empty>Este jugador ya no figura en el plantel actual; se muestran solo los partidos guardados.</Empty>
      )}

      <section>
        <SectionTitle aside={recentAvg != null ? `Promedio: ${recentAvg.toFixed(2)}` : undefined}>
          Rating por partido
        </SectionTitle>
        {chart.length >= 2 ? (
          <div className="card p-4">
            <RatingChart values={chart} />
          </div>
        ) : (
          <Empty>Hacen falta al menos 2 partidos guardados para el gráfico.</Empty>
        )}
      </section>

      {games.length ? (
        <section>
          <SectionTitle aside={`${games.length} partidos guardados`}>Sus partidos</SectionTitle>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-medium">Partido</th>
                  <th className="px-2 py-3 font-medium">Pos</th>
                  <th className="px-2 py-3 text-right font-medium">Rating</th>
                  <th className="px-2 py-3 text-right font-medium">G</th>
                  <th className="px-2 py-3 text-right font-medium">A</th>
                  <th className="px-2 py-3 text-right font-medium">Tiros</th>
                  <th className="px-4 py-3 text-right font-medium">Pases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {games.map((g) => (
                  <tr key={g.matchId} className="row-link">
                    <td className="px-4 py-2.5">
                      <Link href={`/partidos/${g.matchId}`} className="flex items-center gap-3">
                        <ResultPill r={resultOf(g.goals, g.goalsAgainst)} size="sm" />
                        <span>
                          <span className="block font-medium hover:text-accent">
                            {g.goals}-{g.goalsAgainst} vs {g.opponentName ?? "Rival"}
                          </span>
                          <span className="block text-xs text-muted">
                            {MATCH_TYPE_LABEL[g.matchType]} · {fmtDate(g.playedAt)}
                          </span>
                        </span>
                        {g.mom ? (
                          <span className="rounded bg-accent px-1.5 text-[10px] font-bold text-black">MVP</span>
                        ) : null}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-muted">{posShort(g.pos)}</td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums">{g.rating?.toFixed(1) ?? "—"}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{g.playerGoals}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{g.assists}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{g.shots}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {g.passesMade}/{g.passAttempts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function PlayerPage({ params }: PageProps<"/jugador/[name]">) {
  return (
    <Suspense fallback={<Empty>Cargando jugador…</Empty>}>
      <Player params={params} />
    </Suspense>
  );
}
