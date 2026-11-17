import Link from "next/link";
import { MatchList } from "@/components/match-row";
import { Avatar, Crest, Empty, ResultPill, SectionTitle, Stat } from "@/components/ui";
import { club } from "@/lib/config";
import { getClubSummary, getMatches } from "@/lib/data";
import type { EaMember } from "@/lib/ea";
import { displayName, divisionOf, fmtDate, num, playerHref, resultOf } from "@/lib/format";

const DIV_NAMES = ["", "Primera", "Segunda", "Tercera", "Cuarta", "Quinta", "Sexta", "Séptima", "Octava", "Novena", "Décima"];

function Leaders({
  title,
  members,
  value,
  format = (v) => String(v),
  filter = () => true,
}: {
  title: string;
  members: EaMember[];
  value: (m: EaMember) => number;
  format?: (v: number) => string;
  filter?: (m: EaMember) => boolean;
}) {
  const top = members
    .filter(filter)
    .sort((a, b) => value(b) - value(a))
    .slice(0, 3);
  return (
    <div className="card p-4">
      <div className="mb-3 text-xs uppercase tracking-wider text-muted">{title}</div>
      <ol className="space-y-2">
        {top.map((m, i) => {
          const name = displayName(m.name, m);
          return (
            <li key={m.name}>
              <Link href={playerHref(m.name)} className="flex items-center gap-3 rounded-lg hover:text-accent">
                <span className="w-3 text-sm text-muted">{i + 1}</span>
                <Avatar gamertag={m.name} name={name} size={30} />
                <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
                <span className={`display text-2xl font-semibold ${i === 0 ? "text-accent" : ""}`}>
                  {format(value(m))}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default async function Home() {
  const [{ overall, members, season, lastSync }, recent] = await Promise.all([getClubSummary(), getMatches(10)]);

  if (!overall) {
    return (
      <Empty>
        Todavía no hay datos. Corré la sincronización (<code>/api/sync</code>) para traer las estadísticas de EA.
      </Empty>
    );
  }

  const gp = num(overall.gamesPlayed);
  const w = num(overall.wins),
    d = num(overall.ties),
    l = num(overall.losses);
  const gf = num(overall.goals),
    ga = num(overall.goalsAgainst);
  const div = divisionOf(season);
  const form = [...recent].reverse();
  const regulars = (m: EaMember) => num(m.gamesPlayed) >= Math.max(5, gp * 0.1);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="card stripes relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Crest size={88} />
          <div className="flex-1">
            <h1 className="display text-5xl font-bold sm:text-6xl">{club.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              {div ? (
                <span className="display rounded-md bg-kit px-2 py-0.5 text-base font-semibold text-white">
                  {DIV_NAMES[div.value] ?? `${div.value}ª`} División
                </span>
              ) : null}
              <span>Skill rating {overall.skillRating}</span>
              <span>Mejor división: {overall.bestDivision}ª</span>
              <span>
                {overall.promotions} ascensos · {overall.relegations} descensos
              </span>
            </div>
          </div>
          {form.length ? (
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-muted">Últimos {form.length}</div>
              <div className="flex gap-1">
                {form.map((m) => (
                  <ResultPill key={m.matchId} r={resultOf(m.goals, m.goalsAgainst)} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Números del club */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Partidos" value={gp} hint={`${overall.gamesPlayedPlayoff ?? 0} de playoff`} />
        <Stat
          label="G · E · P"
          value={
            <>
              <span className="text-win">{w}</span>
              <span className="px-1 text-muted">·</span>
              {d}
              <span className="px-1 text-muted">·</span>
              <span className="text-loss">{l}</span>
            </>
          }
          hint={`${gp ? Math.round((w / gp) * 100) : 0}% de victorias`}
        />
        <Stat
          label="Goles"
          value={`${gf} - ${ga}`}
          hint={`Diferencia ${gf - ga >= 0 ? "+" : ""}${gf - ga} · ${gp ? (gf / gp).toFixed(2) : 0} por partido`}
        />
        <Stat
          label="Racha"
          value={`${overall.wstreak}G`}
          accent={num(overall.wstreak) >= 3}
          hint={`${overall.unbeatenstreak} sin perder`}
        />
      </section>

      {/* Líderes */}
      {members.length ? (
        <section>
          <SectionTitle aside={<Link href="/plantel" className="hover:text-accent">Ver plantel →</Link>}>
            Líderes
          </SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Leaders title="Goles" members={members} value={(m) => num(m.goals)} />
            <Leaders title="Asistencias" members={members} value={(m) => num(m.assists)} />
            <Leaders
              title="Rating promedio"
              members={members}
              value={(m) => num(m.ratingAve)}
              format={(v) => v.toFixed(1)}
              filter={regulars}
            />
            <Leaders title="Figura del partido" members={members} value={(m) => num(m.manOfTheMatch)} />
          </div>
        </section>
      ) : null}

      {/* Últimos partidos */}
      <section>
        <SectionTitle aside={<Link href="/partidos" className="hover:text-accent">Todos →</Link>}>
          Últimos partidos
        </SectionTitle>
        {recent.length ? (
          <MatchList matches={recent.slice(0, 5)} />
        ) : (
          <Empty>Todavía no hay partidos guardados.</Empty>
        )}
      </section>

      <p className="text-xs text-muted">
        {lastSync ? <>Última actualización: {fmtDate(lastSync.at)} hs. </> : null}
        {div?.manual ? "División cargada a mano (los rankings de EA tardan en actualizarse)." : null}
      </p>
    </div>
  );
}
