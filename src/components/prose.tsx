import Image from "next/image";
import { Fragment } from "react";

/**
 * Texto simple a JSX, sin HTML crudo (nada de inyección):
 * párrafos separados por línea en blanco, "## " títulos, "- " listas y **negrita**.
 */

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function Prose({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`max-w-[68ch] space-y-5 text-lg leading-relaxed ${className}`}>
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) {
          return (
            <h3 key={i} className="tv pt-3 text-4xl">
              {b.slice(3)}
            </h3>
          );
        }
        const lines = b.split("\n");
        if (lines.every((l) => /^[-•]\s/.test(l))) {
          return (
            <ul key={i} className="space-y-2">
              {lines.map((l, k) => (
                <li key={k} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 bg-green-ink" />
                  <span>{inline(l.replace(/^[-•]\s/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, k) => (
              <Fragment key={k}>
                {k ? <br /> : null}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/** Foto de un comunicado: ruta del sitio (optimizada) o link externo. */
export function ComunicadoFoto({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  if (src.startsWith("/")) {
    return (
      <div className={`relative overflow-hidden bg-panel-2 ${className}`}>
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`overflow-hidden bg-panel-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- link externo cargado por la presidencia */}
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}
