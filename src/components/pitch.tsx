import Link from "next/link";
import type { EaMatchPlayer } from "@/lib/ea";
import { extraStats } from "@/lib/events";
import { num } from "@/lib/format";
import { initials } from "./ui";

/**
 * Cancha con las dos formaciones, estilo Sofascore.
 * EA solo dice la línea de cada jugador (arquero, defensa, medio, ataque), no el puesto exacto,
 * y no incluye a los bots: la ubicación es aproximada por línea.
 */

export type PitchPlayer = {
  key: string;
  name: string;
  pos: string;
  rating: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
  mom: boolean;
  href?: string;
  face?: React.ReactNode;
};

const LINES = ["goalkeeper", "defender", "midfielder", "forward"] as const;

export function toPitchPlayers(
  players: EaMatchPlayer[],
  opts: { nameOf?: (p: EaMatchPlayer) => string; hrefOf?: (p: EaMatchPlayer) => string; faceOf?: (p: EaMatchPlayer) => React.ReactNode } = {},
): PitchPlayer[] {
  return players.map((p) => {
    const x = extraStats(p);
    return {
      key: p.playername,
      name: opts.nameOf ? opts.nameOf(p) : p.playername,
      pos: p.pos,
      rating: num(p.rating),
      goals: num(p.goals),
      assists: num(p.assists),
      yellow: x.yellow,
      red: num(p.redcards),
      mom: p.mom === "1",
      href: opts.hrefOf?.(p),
      face: opts.faceOf?.(p),
    };
  });
}

/** Colores de rating como Sofascore. */
export function ratingClass(r: number) {
  if (r >= 9) return "bg-[#2f6fde] text-white";
  if (r >= 8) return "bg-[#1fa6b8] text-white";
  if (r >= 7) return "bg-[#1fa04a] text-white";
  if (r >= 6.5) return "bg-[#c9b02b] text-black";
  if (r >= 6) return "bg-[#e07a1f] text-black";
  return "bg-[#d23a3a] text-white";
}

/** "Ricardo Iorio" → "R. Iorio", como en las alineaciones de TV. */
function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 && name.length > 9 ? `${parts[0][0]}. ${parts.slice(1).join(" ")}` : name;
}

function Token({ p }: { p: PitchPlayer }) {
  const body = (
    <span className="group flex w-[4.5rem] flex-col items-center gap-1 sm:w-24">
      <span className="relative">
        <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border-2 border-white/80 bg-[#0f1312] sm:h-12 sm:w-12">
          {p.face ?? <span className="tv text-xl text-white">{initials(p.name)}</span>}
        </span>
        <span className={`tv absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 pt-0.5 text-base leading-none ${ratingClass(p.rating)}`}>
          {p.rating.toFixed(1)}
        </span>
        {p.mom ? (
          <span className="absolute -top-1 -left-2 grid h-5 w-5 place-items-center rounded-full bg-[#2f6fde] text-sm leading-none text-white" title="Figura del partido">
            ★
          </span>
        ) : null}
        {p.goals || p.assists ? (
          <span className="absolute -top-1 -right-3 flex gap-0.5">
            {p.goals ? (
              <span className="tv rounded-full bg-white px-1.5 pt-0.5 text-sm leading-none text-black" title={`${p.goals} goles`}>
                ⚽{p.goals > 1 ? p.goals : ""}
              </span>
            ) : null}
            {p.assists ? (
              <span className="tv rounded-full bg-white px-1.5 pt-0.5 text-sm leading-none text-black" title={`${p.assists} asistencias`}>
                A{p.assists > 1 ? p.assists : ""}
              </span>
            ) : null}
          </span>
        ) : null}
        {p.yellow || p.red ? (
          <span className="absolute top-3 -right-3 flex gap-0.5">
            {p.yellow ? <span className="block h-4 w-3 rounded-[2px] bg-[#f2c94c]" title="Amarilla" /> : null}
            {p.red ? <span className="block h-4 w-3 rounded-[2px] bg-[#e5383b]" title="Roja" /> : null}
          </span>
        ) : null}
      </span>
      <span className="mt-1 w-full truncate text-center text-sm font-semibold text-white group-hover:underline" title={p.name}>
        {shortName(p.name)}
      </span>
    </span>
  );
  return p.href ? (
    <Link href={p.href} className="rounded focus-visible:outline-white">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Una mitad de cancha: líneas del arquero hacia la mitad (o al revés para el rival). */
function Half({ players, reverse }: { players: PitchPlayer[]; reverse?: boolean }) {
  const lines = LINES.map((l) => players.filter((p) => p.pos === l)).filter((l) => l.length);
  const ordered = reverse ? [...lines].reverse() : lines;
  return (
    <div className="flex flex-1 flex-col justify-around gap-6 py-6 md:flex-row md:gap-2 md:px-4 md:py-4">
      {ordered.map((line, i) => (
        <div key={i} className="flex flex-row items-center justify-around md:flex-col md:justify-around">
          {line.map((p) => (
            <Token key={p.key} p={p} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TeamLabel({ name, t, className = "" }: { name: string; t: PitchPlayer[]; className?: string }) {
  const bots = Math.max(0, 11 - t.length);
  return (
    <div className={`flex min-w-0 items-baseline gap-3 ${className}`}>
      <span className="tv truncate text-3xl">{name}</span>
      <span className="shrink-0 text-sm text-ink-2">
        {shape(t)} · {t.length} jugadores{bots ? ` + ${bots} bots` : ""}
      </span>
    </div>
  );
}

function shape(players: PitchPlayer[]) {
  const c = (l: string) => players.filter((p) => p.pos === l).length;
  return [c("defender"), c("midfielder"), c("forward")].filter(Boolean).join("-");
}

export function Pitch({
  home,
  away,
  homeName,
  awayName,
}: {
  home: PitchPlayer[];
  away: PitchPlayer[];
  homeName: string;
  awayName: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <TeamLabel name={homeName} t={home} />
        <TeamLabel name={awayName} t={away} className="hidden md:flex md:flex-row-reverse" />
      </div>
      <div
        className="relative flex flex-col overflow-hidden rounded-sm border-2 border-white/25 md:min-h-[440px] md:flex-row"
        style={{
          background: "repeating-linear-gradient(90deg, #2f6b45 0 9.09%, #2b6340 9.09% 18.18%)",
        }}
      >
        {/* líneas de la cancha */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 right-0 left-0 h-0.5 bg-white/30 md:top-0 md:bottom-0 md:left-1/2 md:h-auto md:w-0.5" />
          <div className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
          <div className="absolute top-0 left-1/2 h-16 w-44 -translate-x-1/2 border-2 border-t-0 border-white/30 md:top-1/2 md:left-0 md:h-44 md:w-16 md:-translate-x-0 md:-translate-y-1/2 md:border-t-2 md:border-l-0" />
          <div className="absolute bottom-0 left-1/2 h-16 w-44 -translate-x-1/2 border-2 border-b-0 border-white/30 md:top-1/2 md:right-0 md:bottom-auto md:left-auto md:h-44 md:w-16 md:translate-x-0 md:-translate-y-1/2 md:border-r-0 md:border-b-2" />
        </div>
        <Half players={home} />
        <Half players={away} reverse />
      </div>
      <TeamLabel name={awayName} t={away} className="md:hidden" />
      <p className="text-sm text-ink-2">
        Ubicación aproximada: EA solo informa la línea de cada jugador (arquero, defensa, medio, ataque) y no incluye a
        los bots.
      </p>
    </div>
  );
}
