import Link from "next/link";
import type { MatchRow } from "@/lib/data";
import { fmtDate, MATCH_TYPE_LABEL, resultOf } from "@/lib/format";
import { ResultPill } from "./ui";

export function MatchList({ matches, extra }: { matches: MatchRow[]; extra?: (m: MatchRow) => React.ReactNode }) {
  return (
    <ul className="card divide-y divide-line overflow-hidden">
      {matches.map((m) => (
        <li key={m.matchId}>
          <Link href={`/partidos/${m.matchId}`} className="row-link flex items-center gap-3 px-4 py-3">
            <ResultPill r={resultOf(m.goals, m.goalsAgainst)} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">vs {m.opponentName ?? "Rival desconocido"}</div>
              <div className="text-xs text-muted">
                {MATCH_TYPE_LABEL[m.matchType] ?? m.matchType} · {fmtDate(m.playedAt)}
              </div>
            </div>
            {extra ? <div className="hidden text-sm text-muted sm:block">{extra(m)}</div> : null}
            <div className="display text-2xl font-semibold tabular-nums">
              {m.goals}
              <span className="px-1 text-muted">-</span>
              {m.goalsAgainst}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
