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
 * Cara del jugador: la foto si está cargada en config; si no, sus iniciales
 * en la gráfica del club (campo verde plano, letras de TV).
 */
export function PlayerFace({
  gamertag,
  name,
  size = 44,
  shape = "square",
  priority,
}: {
  gamertag: string;
  name: string;
  size?: number;
  shape?: "square" | "portrait";
  priority?: boolean;
}) {
  const photo = playerOverride(gamertag).photo;
  const w = size;
  const h = shape === "portrait" ? Math.round(size * 1.25) : size;
  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={w * 2}
        height={h * 2}
        priority={priority}
        className="shrink-0 object-cover object-top"
        style={{ width: w, height: h }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="tv inline-grid shrink-0 place-items-center overflow-hidden bg-green text-white"
      style={{ width: w, height: h, fontSize: Math.round(w * 0.46) }}
    >
      {initials(name)}
    </span>
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
