"use client";

import { useEffect, useRef, useState } from "react";

/** Número que corre de 0 al valor cuando entra en pantalla, como un marcador. */
export function CountUp({ value, decimals = 0, duration = 1100 }: { value: number; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setShown(value * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    // Arranca en 0 solo si todavía no se ve (si ya está en pantalla, corre desde 0 igual).
    setShown(0);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} aria-label={value.toFixed(decimals)}>
      <span aria-hidden>{shown.toFixed(decimals)}</span>
    </span>
  );
}
