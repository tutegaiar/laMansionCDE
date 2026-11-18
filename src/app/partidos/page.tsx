import type { Metadata } from "next";
import { MatchFilter } from "@/components/match-filter";
import { Empty } from "@/components/ui";
import { getMatchCount, getMatches } from "@/lib/data";

export const metadata: Metadata = { title: "Partidos" };

export default async function PartidosPage() {
  const [matches, total] = await Promise.all([getMatches(400), getMatchCount()]);
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10" data-observe>
        <h1 className="tv wipe text-7xl sm:text-8xl">
          <span>Partidos</span>
        </h1>
        <p className="mt-4 text-lg">{total} partidos guardados, agrupados por noche de juego.</p>
      </header>
      {matches.length ? <MatchFilter matches={matches} /> : <Empty>Todavía no hay partidos guardados.</Empty>}
    </div>
  );
}
