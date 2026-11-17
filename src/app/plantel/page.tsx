import type { Metadata } from "next";
import { SquadTable, type SquadRow } from "@/components/squad-table";
import { Avatar, Empty, SectionTitle } from "@/components/ui";
import { getClubSummary } from "@/lib/data";
import { displayName, num, posLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Plantel" };

export default async function PlantelPage() {
  const { members } = await getClubSummary();
  if (!members.length) return <Empty>Todavía no hay datos del plantel.</Empty>;

  const rows: SquadRow[] = members.map((m) => {
    const name = displayName(m.name, m);
    return {
      gamertag: m.name,
      name,
      pos: posLabel(m.favoritePosition),
      avatar: <Avatar gamertag={m.name} name={name} size={34} />,
      gp: num(m.gamesPlayed),
      goals: num(m.goals),
      assists: num(m.assists),
      rating: num(m.ratingAve),
      mom: num(m.manOfTheMatch),
      passPct: num(m.passSuccessRate),
      winPct: num(m.winRate),
      ovr: num(m.proOverall),
      cleanSheets: num(m.favoritePosition === "goalkeeper" ? m.cleanSheetsGK : m.cleanSheetsDef),
    };
  });

  return (
    <div>
      <SectionTitle aside={`${rows.length} jugadores · tocá una columna para ordenar`}>Plantel</SectionTitle>
      <SquadTable rows={rows} />
      <p className="mt-3 text-xs text-muted">
        Totales del club según EA (todas las competencias). VI = vallas invictas (como arquero o defensor según su
        posición favorita).
      </p>
    </div>
  );
}
