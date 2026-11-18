import Image from "next/image";
import { club, playerOverride } from "@/lib/config";
import { divisionName, divisionTier, type Result } from "@/lib/format";

const RESULT_STYLE: Record<Result, { label: string; cls: string; title: string }> = {
  W: { label: "G", cls: "bg-green text-white", title: "Ganado" },
  D: { label: "E", cls: "bg-draw text-black", title: "Empatado" },
  L: { label: "P", cls: "bg-loss text-white", title: "Perdido" },
};

export function ResultChip({ r, size = "md" }: { r: Result; size?: "sm" | "md" | "lg" }) {
  const s = RESULT_STYLE[r];
  const dim = { sm: "h-6 w-6 text-sm", md: "h-8 w-8 text-lg", lg: "h-11 w-11 text-2xl" }[size];
  return (
    <span className={`tv inline-grid shrink-0 place-items-center ${dim} ${s.cls}`} title={s.title}>
      <span aria-hidden>{s.label}</span>
      <span className="sr-only">{s.title}</span>
    </span>
  );
}

/** Título de sección con la cortinilla verde. */
export function SectionHead({ title, aside, id }: { title: string; aside?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2" data-observe>
      <h2 id={id} className="tv wipe text-5xl sm:text-6xl">
        <span>{title}</span>
      </h2>
      {aside ? <div className="text-base text-ink-2">{aside}</div> : null}
    </div>
  );
}

export function initials(name: string) {
  const parts = name
    .replace(/[_\-.]+/g, " ")
    .replace(/\d+/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/**
 * Cara del jugador para listas y tablas: la miniatura si está cargada en config;
 * si no, sus iniciales en la gráfica del club (campo verde plano, letras de TV).
 */
export function PlayerFace({ gamertag, name, size = 44 }: { gamertag: string; name: string; size?: number }) {
  const mini = playerOverride(gamertag).mini;
  if (mini) {
    return (
      <Image
        src={mini}
        alt=""
        width={size * 2}
        height={size * 2}
        className="shrink-0 bg-green object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="tv inline-grid shrink-0 place-items-center overflow-hidden bg-green text-white"
      style={{ width: size, height: size, fontSize: Math.max(14, Math.round(size * 0.46)) }}
    >
      {initials(name)}
    </span>
  );
}

/** Líneas de velocidad de la gráfica de TV (SVG plano, se mueven en loop). */
export function SpeedLines() {
  const lines = [
    [8, 22, 0.5],
    [18, 46, 0.25],
    [30, 30, 0.4],
    [44, 60, 0.2],
    [58, 26, 0.45],
    [70, 52, 0.3],
    [84, 36, 0.4],
    [94, 64, 0.2],
  ];
  return (
    <svg aria-hidden className="speed-lines absolute inset-0 h-full w-[200%]" viewBox="0 0 200 100" preserveAspectRatio="none">
      {[0, 100].map((off) =>
        lines.map(([y, len, o], i) => (
          <line
            key={`${off}-${i}`}
            x1={off + ((i * 13) % 60)}
            x2={off + ((i * 13) % 60) + len}
            y1={y}
            y2={y - 6}
            stroke="#ffffff"
            strokeOpacity={o * 0.5}
            strokeWidth={0.6 + (i % 3) * 0.5}
            vectorEffect="non-scaling-stroke"
          />
        )),
      )}
    </svg>
  );
}

/**
 * Escenario del jugador: campo verde, líneas de velocidad y el recorte del Pro parado abajo.
 * Sin foto, las iniciales gigantes.
 */
export function PlayerStage({
  gamertag,
  name,
  src,
  priority,
  scene,
  className = "",
}: {
  gamertag: string;
  name: string;
  src?: string;
  priority?: boolean;
  /** Foto con su fondo: ocupa todo el cuadro, sin campo verde. */
  scene?: boolean;
  className?: string;
}) {
  const photo = src ?? playerOverride(gamertag).photo;
  if (photo && scene) {
    return (
      <div className={`relative overflow-hidden bg-panel ${className}`}>
        <Image
          src={photo}
          alt={name}
          fill
          priority={priority}
          sizes="(min-width: 768px) 45vw, 100vw"
          className="scene-drift object-cover object-[55%_35%]"
        />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-green ${className}`}>
      <SpeedLines />
      {photo ? (
        <div className="player-float absolute inset-x-0 bottom-0 top-[6%]">
          <Image
            src={photo}
            alt={name}
            fill
            priority={priority}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-contain object-bottom"
          />
        </div>
      ) : (
        <span aria-hidden className="tv absolute inset-0 grid place-items-center text-[clamp(7rem,22vw,16rem)] text-white">
          {initials(name)}
        </span>
      )}
    </div>
  );
}

export function Crest({ size = 40 }: { size?: number }) {
  if (club.crest) {
    return (
      <Image
        src={club.crest}
        alt={`Escudo de ${club.name}`}
        width={size * 2}
        height={size * 2}
        unoptimized={club.crest.endsWith(".svg")}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="tv inline-grid shrink-0 place-items-center bg-ink text-ground"
      style={{
        width: size,
        height: size * 1.15,
        fontSize: Math.max(14, size * 0.42),
        clipPath: "polygon(0 0, 100% 0, 100% 72%, 50% 100%, 0 72%)",
      }}
    >
      LM
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="border border-line bg-panel px-6 py-12 text-center text-ink-2">{children}</div>;
}

/** Foto carnet: el recorte de la cintura para arriba sobre un fondo claro y liso. */
export function CarnetPhoto({ src, name, className = "" }: { src: string; name: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#eef0ee] ${className}`}>
      <Image src={src} alt={name} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-contain object-bottom" />
    </div>
  );
}

/** Rating por partido, SVG sin librerías. La línea se dibuja al entrar. */
export function RatingChart({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 720,
    h = 200,
    padX = 28,
    padY = 18;
  const min = 5,
    max = 10;
  const x = (i: number) => padX + (i * (w - padX - 8)) / (values.length - 1);
  const y = (v: number) => h - padY - ((Math.min(Math.max(v, min), max) - min) / (max - min)) * (h - padY * 2);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`Rating por partido, promedio ${avg.toFixed(2)}`} data-observe>
      {[6, 7, 8, 9].map((g) => (
        <g key={g}>
          <line x1={padX} x2={w} y1={y(g)} y2={y(g)} stroke="var(--line)" />
          <text x={0} y={y(g) + 5} fontSize="14" fill="var(--ink-2)">
            {g}
          </text>
        </g>
      ))}
      <line x1={padX} x2={w} y1={y(avg)} y2={y(avg)} stroke="var(--ink-2)" strokeDasharray="5 6" />
      <path d={d} pathLength={1} fill="none" stroke="var(--green-ink)" strokeWidth="3" strokeLinejoin="round" className="rating-line" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="4.5" fill="var(--ground)" stroke="var(--green-ink)" strokeWidth="2.5">
          <title>{v.toFixed(1)}</title>
        </circle>
      ))}
    </svg>
  );
}

const TIER_STYLE = {
  gold: "bg-[#e0bb4f] text-[#1c1400]",
  silver: "bg-[#c9ced3] text-[#0b0d0f]",
  bronze: "bg-[#c47d45] text-[#170b02]",
  club: "bg-green text-white",
} as const;

/** Placa de la división, con el metal según el nivel. */
export function DivisionBadge({ division, size = "lg" }: { division: number; size?: "sm" | "lg" }) {
  const tier = divisionTier(division);
  const dim = size === "lg" ? "px-4 pt-2.5 pb-1.5 text-[clamp(2.25rem,5vw,3.5rem)]" : "px-2 pt-1 pb-0.5 text-xl";
  return (
    <span className={`tv inline-flex w-fit items-center ${dim} ${TIER_STYLE[tier]}`}>{divisionName(division)}</span>
  );
}
