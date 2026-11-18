"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type LineupPlayer = {
  gamertag: string;
  name: string;
  sub: string | null;
  highlight: string | null;
  pos: string;
  href: string;
  face: React.ReactNode;
  thumb: React.ReactNode;
  ovr: number;
  stats: { label: string; value: string }[];
};

const STEP_MS = 6000;

const RM = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const mq = matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const motionAllowed = () => !matchMedia(RM).matches;

/**
 * Presentación del plantel como la formación inicial en la tele:
 * pasa solo cada 6 s, se puede deslizar en el celu, y se frena al pasar el mouse o enfocar.
 */
export function Lineup({ players }: { players: LineupPlayer[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const auto = useSyncExternalStore(subscribeMotion, motionAllowed, () => false);

  const go = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const n = (i + players.length) % players.length;
      el.scrollTo({ left: n * el.clientWidth, behavior: auto ? "smooth" : "auto" });
      setActive(n);
    },
    [players.length, auto],
  );

  // Índice activo según el scroll (swipe en el celu).
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  };

  useEffect(() => {
    if (!auto || paused) return;
    const t = setTimeout(() => go(active + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [active, paused, auto, go]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      aria-roledescription="carrusel"
      aria-label="Presentación del plantel"
    >
      <div
        ref={track}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {players.map((p, i) => (
          <article
            key={p.gamertag}
            data-active={i === active}
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${players.length}: ${p.name}`}
            className="group grid w-full shrink-0 snap-start grid-cols-1 gap-0 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          >
            <div className="relative overflow-hidden bg-panel">
              <div className="transition-transform duration-[1200ms] ease-[var(--ease-out)] motion-safe:scale-105 motion-safe:group-data-[active=true]:scale-100">
                {p.face}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 bg-panel px-5 pt-6 pb-6 sm:px-8 md:pt-10 md:pb-10">
              <p className="tv text-4xl text-ink-2 transition-all duration-500 ease-[var(--ease-out)] motion-safe:opacity-0 motion-safe:group-data-[active=true]:opacity-100 lg:text-5xl">
                <span className="text-ink">{i + 1}</span> de {players.length}
                {p.highlight ? <span className="mt-2 block text-green-ink">{p.highlight}</span> : null}
              </p>
              <div className="flex flex-col gap-6">
              <div className="flex items-baseline gap-4 transition-all delay-100 duration-500 ease-[var(--ease-out)] motion-safe:translate-y-3 motion-safe:opacity-0 motion-safe:group-data-[active=true]:translate-y-0 motion-safe:group-data-[active=true]:opacity-100">
                <span className="tv text-2xl text-green-ink">{p.pos}</span>
                {p.ovr ? <span className="tv text-2xl text-ink-2">Media {p.ovr}</span> : null}
              </div>

              <div className="overflow-hidden">
                <Link
                  href={p.href}
                  className="tv block bg-green px-4 pt-3 pb-2 text-6xl text-white transition-transform delay-150 duration-600 ease-[var(--ease-out)] hover:bg-[color-mix(in_oklab,var(--green)_85%,white)] motion-safe:-translate-x-full motion-safe:group-data-[active=true]:translate-x-0 sm:text-7xl lg:text-8xl"
                >
                  <span className="block truncate">{p.name}</span>
                </Link>
                {p.sub ? (
                  <div className="w-fit bg-ink px-4 py-1 text-sm font-semibold text-ground">{p.sub}</div>
                ) : null}
              </div>

              <dl className="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-5">
                {p.stats.map((s, k) => (
                  <div
                    key={s.label}
                    style={{ transitionDelay: `${250 + k * 70}ms` }}
                    className="transition-all duration-500 ease-[var(--ease-out)] motion-safe:translate-y-3 motion-safe:opacity-0 motion-safe:group-data-[active=true]:translate-y-0 motion-safe:group-data-[active=true]:opacity-100"
                  >
                    <dt className="text-sm text-ink-2">{s.label}</dt>
                    <dd className="tv mt-1 text-5xl">{s.value}</dd>
                  </div>
                ))}
              </dl>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Banda de jugadores: cada uno salta a su diapositiva; el activo lleva la barra de tiempo. */}
      <div className="mt-px flex items-stretch gap-px bg-line">
        <button
          type="button"
          onClick={() => go(active - 1)}
          className="tv grid w-12 shrink-0 place-items-center bg-panel text-3xl hover:bg-panel-2"
          aria-label="Jugador anterior"
        >
          ‹
        </button>
        <div className="no-scrollbar flex flex-1 gap-px overflow-x-auto">
          {players.map((p, i) => (
            <button
              key={p.gamertag}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ver a ${p.name}`}
              aria-current={i === active}
              className={`relative flex min-w-[9.5rem] flex-1 items-center gap-3 px-3 py-2 text-left transition-colors ${
                i === active ? "bg-panel-2" : "bg-panel hover:bg-panel-2"
              }`}
            >
              {p.thumb}
              <span className={`tv truncate text-xl ${i === active ? "text-ink" : "text-ink-2"}`}>{p.name}</span>
              {i === active ? (
                <span
                  key={`${active}-${paused}`}
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1 origin-left bg-green-ink"
                  style={
                    auto
                      ? {
                          animation: `progress ${STEP_MS}ms linear both`,
                          animationPlayState: paused ? "paused" : "running",
                        }
                      : undefined
                  }
                />
              ) : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(active + 1)}
          className="tv grid w-12 shrink-0 place-items-center bg-panel text-3xl hover:bg-panel-2"
          aria-label="Jugador siguiente"
        >
          ›
        </button>
      </div>
    </div>
  );
}
