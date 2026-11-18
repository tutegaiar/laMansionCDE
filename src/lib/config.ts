/**
 * Configuración del club. Lo único que hay que tocar a mano.
 */

export type PlayerOverride = {
  /** Nombre grande del jugador en el club (si no, el nombre del Pro que da EA). */
  alias?: string;
  /** Recorte de cuerpo entero sin fondo (PNG/WebP transparente) para el carrusel y la ficha. */
  photo?: string;
  /** Miniatura cuadrada de la cara, para listas y tablas. */
  mini?: string;
  /** Más fotos para la ficha del jugador (se eligen con botones). */
  gallery?: { src: string; label: string; /** Foto con fondo (escena completa), no recorte. */ scene?: boolean }[];
};

export const club = {
  name: "La Mansion CDE",
  /** ID del club en EA. Cambia con cada FC nuevo: si deja de traer datos, buscalo de nuevo. */
  clubId: "480112",
  /** common-gen5 = PS5 / Xbox Series / PC (crossplay). nx = Switch. */
  platform: "common-gen5",
  /**
   * División actual a mano: 0 = Elite, 1 = Primera, 2 = Segunda…
   * Los rankings de EA tardan días en actualizarse, así que si está cargada se usa esta.
   * Dejala en `null` para usar la de EA.
   */
  divisionOverride: 1 as number | null,
  /** Escudo opcional en /public (ej. "/crest.png"). Si no hay, se muestra un monograma. */
  crest: "/crest.svg" as string | null,
};

/**
 * Datos extra por jugador, indexados por gamertag (como lo devuelve EA).
 * Las fotos van en /public/players/.
 */
export const players: Record<string, PlayerOverride> = {
  Jarnkonungr: {
    alias: "Ricardo Iorio",
    photo: "/players/jarnkonungr-gol.webp",
    mini: "/players/jarnkonungr-mini.webp",
    gallery: [
      { src: "/players/jarnkonungr-gol-escena.webp", label: "Gol", scene: true },
      { src: "/players/jarnkonungr-cancha.webp", label: "Cancha" },
      { src: "/players/jarnkonungr-perfil.webp", label: "Perfil" },
      { src: "/players/jarnkonungr-civil.webp", label: "De civil" },
      { src: "/players/jarnkonungr-cara.webp", label: "Cara" },
    ],
  },
  // Sin alias se usa el nombre del Pro que devuelve EA. Ejemplos:
  // "ramaa_damedin": { alias: "Nombre Apellido", photo: "/players/ramaa_damedin.jpg" },
};

export function playerOverride(gamertag: string): PlayerOverride {
  return players[gamertag] ?? {};
}
