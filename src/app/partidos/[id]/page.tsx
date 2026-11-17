import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Avatar, Crest, Empty, ResultPill } from "@/components/ui";
import { club } from "@/lib/config";
import { getClubSummary, getMatch } from "@/lib/data";
import type { EaMatchPlayer } from "@/lib/ea";
import { displayName, fmtDate, MATCH_TYPE_LABEL, num, playerHref, posShort, resultOf } from "@/lib/format";

const POS_ORDER: Record<string, number> = { goalkeeper: 0, defender: 1, midfielder: 2, forward: 3 };

function teamTotals(players: EaMatchPlayer[]) {
  const s = (k: keyof EaMatchPlayer) => players.reduce((a, p) => a + num(p[k]), 0);
  const pa = s("passattempts");
  const ta = s("tackleattempts");
  return {
    shots: s("shots"),
    passes: s("passesmade"),
    passPct: pa ? Math.round((s("passesmade") / pa) * 100) : 0,
    tackles: s("tacklesmade"),
    tacklePct: ta ? Math.round((s("tacklesmade") / ta) * 100) : 0,
    saves: s("saves"),
  };
}

function Compare({ label, a, b, suffix = "" }: { label: string; a: number; b: number; suffix?: string }) {
  const total = a + b || 1;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-semibold tabular-nums">
          {a}
          {suffix}
        </span>
        <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
        <span className="tabular-nums text-muted">
          {b}
          {suffix}
        </span>
      </div>
      <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
        <div className="bg-accent" style={{ width: `${(a / total) * 100}%` }} />
        <div className="bg-surface-2" style={{ width: `${(b / total) * 100}%` }} />
      </div>
    </div>
  );
}

async function MatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, { members }] = await Promise.all([getMatch(id), getClubSummary()]);
  if (!data) notFound();

  const { row, raw } = data;
  const ours = Object.values(raw.players[club.clubId] ?? {}).sort(
    (a, b) => (POS_ORDER[a.pos] ?? 9) - (POS_ORDER[b.pos] ?? 9) || num(b.rating) - num(a.rating),
  );
  const theirs = row.opponentId ? Object.values(raw.players[row.opponentId] ?? {}) : [];
  const t1 = teamTotals(ours),
    t2 = teamTotals(theirs);
  const memberOf = (tag: string) => members.find((m) => m.name === tag);

  return (
    <div className="space-y-8">
      <Link href="/partidos" className="text-sm text-muted hover:text-accent">
        ← Partidos
      </Link>

      <section className="card stripes p-6">
        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted">
          <ResultPill r={resultOf(row.goals, row.goalsAgainst)} size="sm" />
          {MATCH_TYPE_LABEL[row.matchType] ?? row.matchType} · {fmtDate(row.playedAt)}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <Crest size={48} />
            <span className="display text-xl font-semibold">{club.name}</span>
          </div>
          <div className="display text-6xl font-bold tabular-nums sm:text-7xl">
            {row.goals}
            <span className="px-2 text-muted">-</span>
            {row.goalsAgainst}
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="display grid h-[54px] w-12 place-items-center rounded-md bg-surface-2 text-xl text-muted">
              ?
            </span>
            <span className="display text-xl font-semibold">{row.opponentName ?? "Rival"}</span>
          </div>
        </div>
      </section>

      {theirs.length ? (
        <section className="card mx-auto max-w-xl space-y-4 p-5">
          <Compare label="Tiros" a={t1.shots} b={t2.shots} />
          <Compare label="Pases completados" a={t1.passes} b={t2.passes} />
          <Compare label="Efectividad de pase" a={t1.passPct} b={t2.passPct} suffix="%" />
          <Compare label="Quites" a={t1.tackles} b={t2.tackles} />
          <Compare label="Atajadas" a={t1.saves} b={t2.saves} />
        </section>
      ) : null}

      <section>
        <h2 className="display mb-3 text-2xl font-semibold">Nuestros jugadores</h2>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-medium">Jugador</th>
                <th className="px-2 py-3 text-right font-medium">Rating</th>
                <th className="px-2 py-3 text-right font-medium">G</th>
                <th className="px-2 py-3 text-right font-medium">A</th>
                <th className="px-2 py-3 text-right font-medium">Tiros</th>
                <th className="px-2 py-3 text-right font-medium">Pases</th>
                <th className="px-2 py-3 text-right font-medium">Quites</th>
                <th className="px-4 py-3 text-right font-medium">Atajadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ours.map((p) => {
                const name = displayName(p.playername, memberOf(p.playername));
                return (
                  <tr key={p.playername} className="row-link">
                    <td className="px-4 py-2.5">
                      <Link href={playerHref(p.playername)} className="flex items-center gap-3">
                        <Avatar gamertag={p.playername} name={name} size={30} />
                        <span className="font-medium hover:text-accent">{name}</span>
                        <span className="text-xs text-muted">{posShort(p.pos)}</span>
                        {p.mom === "1" ? (
                          <span className="rounded bg-accent px-1.5 text-[10px] font-bold text-black">MVP</span>
                        ) : null}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums">{num(p.rating).toFixed(1)}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{p.goals}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{p.assists}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{p.shots}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {p.passesmade}/{p.passattempts}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {p.tacklesmade}/{p.tackleattempts}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.saves}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function MatchPage({ params }: PageProps<"/partidos/[id]">) {
  return (
    <Suspense fallback={<Empty>Cargando partido…</Empty>}>
      <MatchDetail params={params} />
    </Suspense>
  );
}
