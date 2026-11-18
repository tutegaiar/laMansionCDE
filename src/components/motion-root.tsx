"use client";

import { useEffect } from "react";

/**
 * Marca con data-in los elementos [data-reveal] / [data-observe] cuando entran en pantalla.
 * El CSS hace el resto (globals.css). Observa también lo que aparece después
 * (navegación del lado del cliente, Suspense).
 */
export function MotionRoot() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = () =>
      document.querySelectorAll("[data-reveal]:not([data-in]), [data-observe]:not([data-in])").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
