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
  /** Foto con fondo (escena completa, ej. festejando un gol) para el carrusel del plantel. */
  scene?: string;
  /** Foto carnet (recorte de la cintura para arriba) para la ficha del jugador, sobre fondo claro. */
  carnet?: string;
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
  /** Foto grande de la apertura (escena con fondo). `null` = solo el escudo sobre el verde. */
  heroImage: "/players/jarnkonungr-gol-escena.webp" as string | null,
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
    mini: "/players/jarnkonungr-mini-v2.webp",
    scene: "/players/jarnkonungr-gol-escena.webp",
    carnet: "/players/jarnkonungr-carnet-v2.webp",
  },
  // Sin alias se usa el nombre del Pro que devuelve EA. Ejemplos:
  // "ramaa_damedin": { alias: "Nombre Apellido", photo: "/players/ramaa_damedin.jpg" },
};

export function playerOverride(gamertag: string): PlayerOverride {
  return players[gamertag] ?? {};
}
