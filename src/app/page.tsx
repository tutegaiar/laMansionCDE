import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { Leaders, type LeaderBoard } from "@/components/leaders";
import { Lineup } from "@/components/lineup";
import { Ticker } from "@/components/ticker";
import { Crest, DivisionBadge, Empty, PlayerFace, ResultChip, SectionHead } from "@/components/ui";
import { club } from "@/lib/config";
import { getClubSummary, getMatchCount, getMatches, getPlayersInMatches } from "@/lib/data";
import type { EaMember } from "@/lib/ea";
import { displayName, divisionOf, fmtDay, fmtTime, gamertagLabel, num, playerHref, resultOf } from "@/lib/format";
import { buildLineup } from "@/lib/lineup-data";
import { groupNights } from "@/lib/nights";


function boards(members: EaMember[], gp: number): LeaderBoard[] {
  const nameOf = (m: EaMember) => displayName(m.name, m);
  const make = (
    key: string,
    label: string,
    value: (m: EaMember) => number,
    fmt: (v: number) => string,
    finding: (top: EaMember, v: number) => string,
    filter: (m: EaMember) => boolean = () => true,
  ): LeaderBoard => {
    const rows = members
      .filter(filter)
      .sort((a, b) => value(b) - value(a))
      .slice(0, 6);
    return {
      key,
      label,
      finding: rows[0] ? finding(rows[0], value(rows[0])) : "",
      rows: rows.map((m) => ({
        name: nameOf(m),
        sub: gamertagLabel(m.name, nameOf(m)),
        href: playerHref(m.name),
        value: value(m),
        display: fmt(value(m)),
        thumb: <PlayerFace gamertag={m.name} name={nameOf(m)} size={40} />,
      })),
    };
  };
  const regular = (m: EaMember) => num(m.gamesPlayed) >= Math.max(5, gp * 0.1);
  return [
    make("goles", "Goles", (m) => num(m.goals), String, (t, v) => `${nameOf(t)} lleva ${v} goles en ${t.gamesPlayed} partidos.`),
    make("asist", "Asistencias", (m) => num(m.assists), String, (t, v) => `${nameOf(t)} dio ${v} asistencias, más que nadie en el club.`),
    make(
      "rating",
      "Rating",
      (m) => num(m.ratingAve),
      (v) => v.toFixed(1),
      (t, v) => `${nameOf(t)} tiene el mejor promedio: ${v.toFixed(1)} por partido.`,
      regular,
    ),
    make("mvp", "Figura", (m) => num(m.manOfTheMatch), String, (t, v) => `${nameOf(t)} fue la figura del partido ${v} veces.`),
  ];
}

export default async function Home() {
  const [{ overall, members, season }, recent, total] = await Promise.all([getClubSummary(), getMatches(60), getMatchCount()]);

  if (!overall) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h1 className="tv mb-6 text-6xl">{club.name}</h1>
        <Empty>Todavía no hay datos. Corré la sincronización para traer las estadísticas de EA.</Empty>
      </div>
    );
  }

  const gp = num(overall.gamesPlayed);
  const w = num(overall.wins);
  const div = divisionOf(season);
  const nights = groupNights(recent);
  const night = nights[0];
  const nightPlayers = night ? await getPlayersInMatches(night.matches.map((m) => m.matchId)) : [];
  const figure = [...nightPlayers].sort((a, b) => b.mom - a.mom || b.goals - a.goals || (b.rating ?? 0) - (a.rating ?? 0))[0];
  const figureMember = figure ? members.find((m) => m.name === figure.name) : undefined;
  const last = recent[0];
  const streak = num(overall.wstreak);

  return (
    <>
      {/* ---------- Apertura de la transmisión ---------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 hidden w-[42%] bg-green md:block"
          style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-8 pb-12 sm:px-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:pt-12 md:pb-16">
          <div className="flex flex-col gap-8">
            {last ? (
              <Link
                href={`/partidos/${last.matchId}`}
                data-reveal
                className="flex max-w-full w-fit items-stretch border border-line bg-panel text-xl hover:border-ink-2"
              >
                <span className="tv flex items-center gap-2 bg-ink px-3 text-ground">
                  <span className="live-dot inline-block h-2.5 w-2.5 rounded-full bg-loss" aria-hidden />
                  Final
                </span>
                <span className="tv flex min-w-0 items-center gap-2 px-3 py-2 text-xl whitespace-nowrap sm:text-2xl">
                  LMC {last.goals}
                  <span className="text-ink-2">–</span>
                  {last.goalsAgainst} <span className="truncate">{last.opponentName ?? "Rival"}</span>
                </span>
              </Link>
            ) : null}

            <div>
              <h1 className="tv text-[clamp(4rem,13vw,9.5rem)]" data-reveal style={{ ["--i" as string]: 1 }}>
                <span className="whitespace-nowrap">La Mansion</span>
                <br />
                <span className="text-green-ink">CDE</span>
              </h1>
              <div className="mt-6 flex flex-col gap-3" data-reveal style={{ ["--i" as string]: 2 }}>
                {div ? <DivisionBadge division={div.value} /> : null}
                <p className="text-xl">Estadio Garden · Crossplay Play, Xbox y PC</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4" data-reveal style={{ ["--i" as string]: 3 }}>
              {[
                { label: "Partidos", value: gp },
                { label: "Ganados", value: w },
                { label: "Goles", value: num(overall.goals) },
                { label: "Racha", value: streak, suffix: streak ? "G" : "" },
              ].map((s) => (
                <div key={s.label} className="bg-ground px-4 py-3">
                  <dt className="text-sm whitespace-nowrap text-ink-2">{s.label}</dt>
                  <dd className="tv mt-1 text-6xl">
                    <CountUp value={s.value} />
                    {s.suffix}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative flex items-center justify-center md:justify-end" data-reveal style={{ ["--i" as string]: 2 }}>
            <div className="flex aspect-square w-[min(56vw,24rem)] items-center justify-center bg-green md:bg-transparent">
              <Crest size={220} />
            </div>
          </div>
        </div>
      </section>

      <Ticker matches={recent.slice(0, 12)} />

      <div className="mx-auto max-w-7xl space-y-24 px-4 py-20 sm:px-6">
        {/* ---------- La última noche ---------- */}
        {night ? (
          <section aria-labelledby="noche">
            <SectionHead id="noche" title="La última noche" aside={`${fmtDay(night.start)} · ${fmtTime(night.start)} a ${fmtTime(night.end)} hs`} />
            <div className="grid gap-px bg-line lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="flex flex-col justify-between gap-8 bg-panel p-6 sm:p-8" data-reveal>
                <div>
                  <dl className="flex gap-6 sm:gap-8">
                    {[
                      { label: night.w === 1 ? "Ganado" : "Ganados", v: night.w, cls: "text-green-ink" },
                      { label: night.d === 1 ? "Empate" : "Empates", v: night.d, cls: "" },
                      { label: night.l === 1 ? "Perdido" : "Perdidos", v: night.l, cls: night.l ? "text-loss-ink" : "" },
                    ].map((x) => (
                      <div key={x.label}>
                        <dd className={`tv text-8xl ${x.cls}`}>
                          <CountUp value={x.v} />
                        </dd>
                        <dt className="mt-1 text-base text-ink-2">{x.label}</dt>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-6 text-xl">
                    {night.matches.length} {night.matches.length === 1 ? "partido" : "partidos"}, {night.gf} goles a favor y{" "}
                    {night.ga} en contra.
                  </p>
                </div>
                {figure ? (
                  <Link href={playerHref(figure.name)} className="group block">
                    <p className="mb-2 text-base text-ink-2">Figura de la noche</p>
                    <div className="flex items-stretch">
                      <PlayerFace gamertag={figure.name} name={displayName(figure.name, figureMember)} size={112} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="tv flex-1 truncate bg-green px-3 pt-3 pb-1 text-6xl text-white group-hover:underline">
                          {displayName(figure.name, figureMember)}
                        </span>
                        <span className="bg-ink px-3 py-1.5 text-base font-semibold text-ground">
                          {gamertagLabel(figure.name, displayName(figure.name, figureMember)) ? (
                            <span className="mr-2 font-normal">{figure.name} ·</span>
                          ) : null}
                          {figure.goals} goles · {figure.assists} asist. · {figure.mom} {figure.mom === 1 ? "vez figura" : "veces figura"}
                          {figure.rating != null ? ` · ${figure.rating.toFixed(1)} de rating` : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : null}
              </div>

              <ol className="flex flex-col gap-px bg-line">
                {night.matches.slice(0, 6).map((m, i) => (
                  <li key={m.matchId} data-reveal style={{ ["--i" as string]: i }}>
                    <Link
                      href={`/partidos/${m.matchId}`}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 bg-panel px-5 py-4 transition-colors hover:bg-panel-2 sm:px-6"
                    >
                      <ResultChip r={resultOf(m.goals, m.goalsAgainst)} />
                      <span className="min-w-0">
                        <span className="tv block truncate text-3xl">{m.opponentName ?? "Rival"}</span>
                        <span className="text-base text-ink-2">{fmtTime(m.playedAt)} hs</span>
                      </span>
                      <span className="tv text-5xl sm:text-6xl">
                        {m.goals}
                        <span className="px-1 text-ink-2">–</span>
                        {m.goalsAgainst}
                      </span>
                    </Link>
                  </li>
                ))}
                {night.matches.length > 6 ? (
                  <li>
                    <Link href="/partidos" className="tv flex min-h-14 items-center bg-panel px-6 text-2xl text-ink-2 hover:text-ink">
                      Y {night.matches.length - 6} partidos más esa noche
                    </Link>
                  </li>
                ) : null}
              </ol>
            </div>
          </section>
        ) : null}

        {/* ---------- Formación ---------- */}
        {members.length ? (
          <section aria-labelledby="plantel">
            <SectionHead
              id="plantel"
              title="El plantel"
              aside={
                <Link href="/plantel" className="underline-offset-4 hover:underline">
                  Ver la tabla completa
                </Link>
              }
            />
            <div data-reveal>
              <Lineup players={buildLineup(members)} />
            </div>
          </section>
        ) : null}

        {/* ---------- Líderes ---------- */}
        {members.length ? (
          <section aria-labelledby="lideres">
            <SectionHead id="lideres" title="Los que la rompen" />
            <div data-reveal>
              <Leaders boards={boards(members, gp)} />
            </div>
          </section>
        ) : null}

        {/* ---------- Historial ---------- */}
        <section aria-labelledby="historial" className="grid items-end gap-8 border-t border-line pt-12 md:grid-cols-[1fr_auto]">
          <div>
            <h2 id="historial" className="tv text-5xl sm:text-6xl">
              Todo el historial
            </h2>
            <p className="mt-3 max-w-xl text-lg">
              EA muestra solo los últimos 10 partidos. Esta página ya guardó {total} y sigue sumando cada noche.
            </p>
          </div>
          <Link href="/partidos" className="tv inline-flex min-h-14 items-center bg-green px-6 text-3xl text-white hover:bg-[color-mix(in_oklab,var(--green)_85%,white)]">
            Ver los partidos
          </Link>
        </section>
      </div>
    </>
  );
}
