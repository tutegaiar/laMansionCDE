import Image from "next/image";
import { club, playerOverride } from "@/lib/config";
import { resultLabel, type Result } from "@/lib/format";

export function ResultPill({ r, size = "md" }: { r: Result; size?: "sm" | "md" }) {
  const color = { W: "bg-win text-black", D: "bg-draw text-black", L: "bg-loss text-black" }[r];
  const dim = size === "sm" ? "h-5 w-5 text-[11px]" : "h-7 w-7 text-sm";
  return (
    <span
      className={`display inline-grid place-items-center rounded-md font-semibold ${dim} ${color}`}
      title={{ W: "Ganado", D: "Empatado", L: "Perdido" }[r]}
    >
      {resultLabel[r]}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="card px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className={`display mt-1 text-4xl font-semibold ${accent ? "text-accent" : ""}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="display text-2xl font-semibold">{children}</h2>
      {aside ? <div className="text-sm text-muted">{aside}</div> : null}
    </div>
  );
}

function initials(name: string) {
  const parts = name.replace(/[_\d]+/g, " ").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Foto del jugador si está cargada en config; si no, iniciales con los colores del club. */
export function Avatar({ gamertag, name, size = 40 }: { gamertag: string; name: string; size?: number }) {
  const photo = playerOverride(gamertag).photo;
  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover ring-1 ring-line"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="display inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ring-1 ring-line"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: "linear-gradient(135deg, var(--kit-2), var(--accent-ink))",
      }}
    >
      {initials(name)}
    </span>
  );
}

export function Crest({ size = 56 }: { size?: number }) {
  if (club.crest) {
    return <Image src={club.crest} alt={club.name} width={size} height={size} className="shrink-0" />;
  }
  return (
    <span
      aria-hidden
      className="display inline-grid shrink-0 place-items-center font-bold text-white"
      style={{
        width: size,
        height: size * 1.12,
        fontSize: size * 0.34,
        clipPath: "polygon(50% 100%, 0 78%, 0 0, 100% 0, 100% 78%)",
        background: "linear-gradient(180deg, var(--kit-2) 0 55%, var(--kit-1) 55%)",
        boxShadow: "inset 0 0 0 2px var(--kit-3)",
      }}
    >
      LM
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card px-5 py-10 text-center text-sm text-muted">{children}</div>;
}

/** Línea de rating por partido (SVG puro, sin librerías). */
export function RatingChart({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 600,
    h = 140,
    pad = 18;
  const min = 5,
    max = 10;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (values.length - 1);
  const y = (v: number) => h - pad - ((Math.min(Math.max(v, min), max) - min) / (max - min)) * (h - pad * 2);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Rating por partido">
      {[6, 7, 8, 9].map((g) => (
        <g key={g}>
          <line x1={pad} x2={w - pad} y1={y(g)} y2={y(g)} stroke="var(--line)" />
          <text x={2} y={y(g) + 4} fontSize="10" fill="var(--muted)">
            {g}
          </text>
        </g>
      ))}
      <line x1={pad} x2={w - pad} y1={y(avg)} y2={y(avg)} stroke="var(--muted)" strokeDasharray="4 4" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2">
          <title>{v.toFixed(1)}</title>
        </circle>
      ))}
    </svg>
  );
}
