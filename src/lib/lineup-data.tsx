import type { LineupPlayer } from "@/components/lineup";
import { PlayerFace } from "@/components/ui";
import type { EaMember } from "./ea";
import { displayName, num, playerHref, posLabel } from "./format";

const POS_ORDER: Record<string, number> = { goalkeeper: 0, defender: 1, midfielder: 2, forward: 3 };

/** Arma las diapositivas del carrusel del plantel a partir de los miembros de EA. */
export function buildLineup(members: EaMember[]): LineupPlayer[] {
  return [...members]
    .sort((a, b) => (POS_ORDER[a.favoritePosition] ?? 9) - (POS_ORDER[b.favoritePosition] ?? 9) || num(b.gamesPlayed) - num(a.gamesPlayed))
    .map((m) => {
      const name = displayName(m.name, m);
      const gk = m.favoritePosition === "goalkeeper";
      return {
        gamertag: m.name,
        name,
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
