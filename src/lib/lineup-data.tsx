import type { LineupPlayer } from "@/components/lineup";
import { PlayerFace } from "@/components/ui";
import type { EaMember } from "./ea";
import { displayName, gamertagLabel, num, playerHref, posLabel } from "./format";

const POS_ORDER: Record<string, number> = { goalkeeper: 0, defender: 1, midfielder: 2, forward: 3 };

/** Arma las diapositivas del carrusel del plantel a partir de los miembros de EA. */
const ORD = ["", "1º", "2º", "3º"];

/** El mejor puesto real del jugador dentro del club (ej. "2º en asistencias del club"). */
function highlight(m: EaMember, members: EaMember[]): string | null {
  const cats: { label: string; v: (x: EaMember) => number; ok?: (x: EaMember) => boolean }[] = [
    { label: "goleador del club", v: (x) => num(x.goals) },
    { label: "en asistencias del club", v: (x) => num(x.assists) },
    { label: "en veces figura del club", v: (x) => num(x.manOfTheMatch) },
    { label: "en rating del club", v: (x) => num(x.ratingAve), ok: (x) => num(x.gamesPlayed) >= 10 },
    { label: "con más partidos en el club", v: (x) => num(x.gamesPlayed) },
  ];
  let best: { rank: number; label: string } | null = null;
  for (const c of cats) {
    if (c.ok && !c.ok(m)) continue;
    const pool = members.filter((x) => !c.ok || c.ok(x));
    const rank = 1 + pool.filter((x) => c.v(x) > c.v(m)).length;
    if (rank <= 3 && c.v(m) > 0 && (!best || rank < best.rank)) best = { rank, label: c.label };
  }
  if (!best) return null;
  return `${ORD[best.rank]} ${best.label}`;
}

export function buildLineup(members: EaMember[]): LineupPlayer[] {
  return [...members]
    .sort((a, b) => (POS_ORDER[a.favoritePosition] ?? 9) - (POS_ORDER[b.favoritePosition] ?? 9) || num(b.gamesPlayed) - num(a.gamesPlayed))
    .map((m) => {
      const name = displayName(m.name, m);
      const gk = m.favoritePosition === "goalkeeper";
      return {
        gamertag: m.name,
        name,
        sub: gamertagLabel(m.name, name),
        highlight: highlight(m, members),
        pos: posLabel(m.favoritePosition),
        href: playerHref(m.name),
        ovr: num(m.proOverall),
        face: <BigFace gamertag={m.name} name={name} />,
        thumb: <PlayerFace gamertag={m.name} name={name} size={36} />,
        stats: [
          { label: "Partidos", value: String(num(m.gamesPlayed)) },
          gk
            ? { label: "Vallas invictas", value: String(num(m.cleanSheetsGK)) }
            : { label: "Goles", value: String(num(m.goals)) },
          { label: "Asistencias", value: String(num(m.assists)) },
          { label: "Rating", value: num(m.ratingAve).toFixed(1) },
          { label: "Figura", value: String(num(m.manOfTheMatch)) },
        ],
      };
    });
}

/** Retrato grande: la foto si hay, si no las iniciales gigantes sobre el verde del club. */
function BigFace({ gamertag, name }: { gamertag: string; name: string }) {
  return (
    <div className="relative aspect-[4/3] w-full sm:aspect-[4/5] md:aspect-auto md:h-[min(70vh,620px)]">
      <div className="absolute inset-0 [&>*]:!h-full [&>*]:!w-full [&>span]:!text-[clamp(7rem,22vw,16rem)]">
        <PlayerFace gamertag={gamertag} name={name} size={400} shape="portrait" />
      </div>
    </div>
  );
}
