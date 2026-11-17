import type { Metadata } from "next";
import { MatchFilter } from "@/components/match-filter";
import { Empty, SectionTitle } from "@/components/ui";
import { getMatchCount, getMatches } from "@/lib/data";

export const metadata: Metadata = { title: "Partidos" };

export default async function PartidosPage() {
  const [matches, total] = await Promise.all([getMatches(300), getMatchCount()]);
  return (
    <div>
      <SectionTitle aside={`${total} guardados desde que arrancó la página`}>Partidos</SectionTitle>
      {matches.length ? <MatchFilter matches={matches} /> : <Empty>Todavía no hay partidos guardados.</Empty>}
    </div>
  );
}
