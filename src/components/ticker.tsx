import Link from "next/link";
import type { MatchRow } from "@/lib/data";
import { resultOf } from "@/lib/format";
import { ResultChip } from "./ui";

/** Zócalo de resultados que corre como en la tele. Se frena con el mouse o el foco. */
export function Ticker({ matches }: { matches: MatchRow[] }) {
  if (!matches.length) return null;
  const items = matches.map((m) => (
    <Link
      key={m.matchId}
      href={`/partidos/${m.matchId}`}
      className="flex shrink-0 items-center gap-3 px-6 py-3 hover:bg-panel-2"
    >
      <ResultChip r={resultOf(m.goals, m.goalsAgainst)} size="sm" />
      <span className="tv text-2xl whitespace-nowrap">
        Mansion {m.goals}
        <span className="px-1.5 text-ink-2">–</span>
        {m.goalsAgainst} {m.opponentName ?? "Rival"}
      </span>
    </Link>
  ));
  return (
    <section aria-label="Últimos resultados" className="ticker overflow-hidden border-y border-line bg-panel">
      <div className="flex">
        <span className="tv z-10 flex shrink-0 items-center bg-green px-4 text-2xl text-white">Resultados</span>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-track flex w-max" style={{ ["--ticker-dur" as string]: `${matches.length * 6}s` }}>
            {items}
            <div aria-hidden className="flex" inert>
              {items}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
