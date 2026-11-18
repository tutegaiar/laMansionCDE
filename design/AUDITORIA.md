# Auditoría — La Mansion CDE — 2026-11-18
Alcance: resumen, plantel, partidos, partido, jugador · Modo: experiencia + operar · Stack: Next 16 + Tailwind 4
Herramientas: Playwright a 1440 / 768 / 390 + gate manual (taste-skill, impeccable y Emil no están instalados en este entorno)

## Resumen en tres líneas
La dirección "transmisión de TV" ya sostiene la identidad (Garden, camiseta, la noche de juego).
Esta ronda arregló desbordes en celular, un bloque de texto de 4 líneas y una tabla que scrolleaba de costado.
Lo que más falta ahora no es diseño: son las imágenes reales (escudo y fotos de los Pros).

## Puntaje técnico — 17/20 (bien)
| # | Dimensión | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Accesibilidad | 4 | contraste ≥ 4.5:1 en todo texto, foco visible, skip link, reduced-motion conserva el contenido |
| 2 | Performance | 3 | solo transform/opacity; una fuente variable; sin imágenes todavía (cuando lleguen: WebP + tamaño) |
| 3 | Theming | 4 | tokens en :root, colores de la camiseta inyectados desde EA |
| 4 | Responsive | 3 | 0 overflow en 390 tras esta ronda; plantel con composición propia en el celu |
| 5 | Integridad | 3 | todos los datos son reales; el "mejor puesto" del carrusel se calcula, no se inventa |

## Crítica — 7.7 (diseño 8, usabilidad 8, creatividad 7.5, contenido 7) · caps: ninguno
- Pasada 5 (espacio): el carrusel tenía ~300 px vacíos arriba a la derecha → se llenó con "N de 9" y el mejor puesto real en el club.
- Pasada 6 (tipo): "16 partidos: 9 ganados, 3 empates, 4 perdidos" ocupaba 4 líneas → récord de la noche como marcador (9 · 3 · 4).
- Pasada 8 (imágenes): 0 imágenes reales. Escudo y retratos son el siguiente salto de calidad.
- Pasada 10 (teléfono): tabla del plantel con scroll lateral → lista con selector de orden.
- Pasada 13 (colisiones): nombre del jugador desbordaba en 390 (535 px) → tamaño fluido + corte de línea.

## Pedidos del usuario resueltos en esta ronda
- Nombre del club en grande (alias en config > nombre del Pro en EA) y gamertag de EA chiquito en todas las vistas.
- Placa de división grande con metal por nivel: Elite y Primera oro, 2ª–3ª plata, 4ª–5ª bronce; también en el header.

## Las tres cosas que más mueven la aguja ahora
1. Escudo real (`public/crest.png`) → apertura, header y cada partido.
2. Fotos de los Pros (`public/players/`, recorte vertical) → el carrusel deja de ser iniciales.
3. Nombres completos de cada jugador en `src/lib/config.ts` (EA solo da el apellido del Pro).

## Medidas (antes → después)
| Métrica | Antes | Después |
|---|---|---|
| Overflow horizontal en 390 | jugador 535 px | 0 en las 5 páginas |
| Texto < 14 px | 12.6 px (escudo del header) | ninguno |
| Bloques de 3+ líneas en display | 1 (resumen de la noche) | 0 |
| Fuentes cargadas | Archivo variable | Archivo variable |
