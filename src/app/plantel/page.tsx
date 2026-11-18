import type { Metadata } from "next";
import { SquadTable, type SquadRow } from "@/components/squad-table";
import { Empty, PlayerFace } from "@/components/ui";
import { getClubSummary, getDiscipline } from "@/lib/data";
import { displayName, gamertagLabel, num, posLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Plantel" };

export default async function PlantelPage() {
  const [{ members }, discipline] = await Promise.all([getClubSummary(), getDiscipline()]);

  const rows: SquadRow[] = members.map((m) => {
    const name = displayName(m.name, m);
    return {
      gamertag: m.name,
      name,
      sub: gamertagLabel(m.name, name),
      pos: posLabel(m.favoritePosition),
      avatar: <PlayerFace gamertag={m.name} name={name} size={44} />,
      gp: num(m.gamesPlayed),
      goals: num(m.goals),
      assists: num(m.assists),
      rating: num(m.ratingAve),
      mom: num(m.manOfTheMatch),
      passPct: num(m.passSuccessRate),
      winPct: num(m.winRate),
      ovr: num(m.proOverall),
      cleanSheets: num(m.favoritePosition === "goalkeeper" ? m.cleanSheetsGK : m.cleanSheetsDef),
      yellow: discipline.find((d) => d.name === m.name)?.yellow ?? 0,
      red: Math.max(num(m.redCards), discipline.find((d) => d.name === m.name)?.red ?? 0),
      fouls: discipline.find((d) => d.name === m.name)?.fouls ?? 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-10" data-observe>
        <h1 className="tv wipe text-7xl sm:text-8xl">
          <span>Plantel</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg">
          {rows.length} jugadores. Ordenalos por el dato que quieras y tocá uno para ver su ficha.
        </p>
      </header>
      {rows.length ? (
        <div data-reveal>
          <SquadTable rows={rows} />
        </div>
      ) : (
        <Empty>Todavía no hay datos del plantel.</Empty>
      )}
      <p className="mt-4 text-sm text-ink-2">
        Totales del club según EA, todas las competencias. VI: vallas invictas, como arquero o defensor según su posición
        favorita. TA y faltas: partidos guardados por la página (EA no da el total).
      </p>
    </div>
  );
}
