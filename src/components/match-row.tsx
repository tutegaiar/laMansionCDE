import Link from "next/link";
import type { MatchRow } from "@/lib/data";
import { fmtTime, MATCH_TYPE_LABEL, resultOf } from "@/lib/format";
import { ResultChip } from "./ui";

export function MatchList({ matches }: { matches: MatchRow[] }) {
  return (
    <ul className="flex flex-col gap-px bg-line">
      {matches.map((m) => (
        <li key={m.matchId}>
          <Link
            href={`/partidos/${m.matchId}`}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-4 bg-panel px-4 py-3 transition-colors hover:bg-panel-2 sm:px-6"
          >
            <ResultChip r={resultOf(m.goals, m.goalsAgainst)} />
            <span className="min-w-0">
              <span className="tv block truncate text-3xl">{m.opponentName ?? "Rival"}</span>
              <span className="text-sm text-ink-2">
                {MATCH_TYPE_LABEL[m.matchType] ?? m.matchType} · {fmtTime(m.playedAt)} hs
              </span>
            </span>
            <span className="tv text-5xl">
              {m.goals}
              <span className="px-1 text-ink-2">–</span>
              {m.goalsAgainst}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
