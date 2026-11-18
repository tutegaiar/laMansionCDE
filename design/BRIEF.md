# Brief de diseño — La Mansion CDE
Fecha: 2026-11-18 · Modo: auditoría → **redesign**
Tipo de producto: híbrido — vidriera del club (Experiencia/Persuadir) + stats (Operar/Leer)

## Sujeto
Club de Clubes Pro (EA SPORTS FC 27) de un grupo de amigos argentinos. Crossplay PS5/Xbox/PC.
Página propia en Vercel que guarda cada partido (EA solo muestra los últimos 10).

## Audiencia en situación
El plantel (9 jugadores) y gente cercana. Mitad celular, mitad PC (dicho por el usuario).
Inferido: la abren de noche, justo después de una tanda de partidos, para ver cómo les fue
y quién la rompió; el link circula por WhatsApp.

## La única acción
Ver "cómo nos fue" (el último partido / la tanda de hoy) y entrar al perfil de un jugador.

## Argumento de la página (home)
1. Somos La Mansion, en Primera — prueba: división, récord 79-20-61, racha actual.
2. Así nos fue la última noche — prueba: la tanda de partidos guardados con marcador real.
3. Este es el plantel — prueba: los 9 jugadores con sus números (goles, asist., rating, MVP).
4. Los que la rompen — prueba: líderes reales por categoría.
5. Historial — prueba: partidos guardados por la página.

## Inventario del sujeto
- Nombre: "La Mansion CDE" (qué significa CDE: abierto). Estadio: **Garden**.
- Camiseta titular negra (#090b0d) con verde (#147027) y detalle gris claro; alternativa blanca
  (#f2f2f2); tercera roja (#c02036). Escudo propio (PNG, lo pasa el usuario).
- Subieron a **Primera División**: 8 ascensos, 1 descenso, skill rating 1951.
- Juegan de noche, en tandas de ~5 partidos seguidos (22:56 → 00:35 el 16/11, 5 victorias).
- 9 jugadores; arquero Jarnkonungr (Pro "Iorio", 2,00 m), goleador PF Gonzalez (73).
- Crossplay: gamertags de Play, Xbox y PC en el mismo plantel.
- Rivales reales con nombres propios (CGA FC, Vino Tinto, P0CH0CL0S FC…).
- Datos por partido: rating, goles, asistencias, tiros, pases, quites, atajadas, MVP.

## Material real disponible
Escudo: sí (PNG) · Fotos de jugadores: no por ahora (se suben después a /public/players)
· Capturas de partidos: no · Video: no.
Lo que NO hay y no se va a fingir: fotos de jugadores, resultados, rivales.
Plan de imágenes: escudo + tipografía + datos como imagen; los retratos aparecen cuando
existan y el diseño tiene que verse completo sin ellos.

## Fijos
Stack: Next.js 16 (App Router, Cache Components) + Tailwind 4, Vercel, Neon.
Debe sobrevivir: rutas (/, /plantel, /partidos, /partidos/[id], /jugador/[name]), sync, datos.
Pedidos explícitos: "quiero una que tenga muchas animaciones, que pasen fotos, jugadores del
club cuando ponga las imágenes". Hoy le molesta: "se ve genérica", "le falta impacto/onda".
Le gusta: los datos que muestra.

## Dirección (paso 5)
Repartidas a mano (dado: 2, 5, 4): Transmisión de TV · Dorsal / textil · Marcador del estadio
+ salida estándar (app de resultados tipo FotMob bien hecha).

## Abierto
- Qué significa "CDE".
- Fotos de los Pros: formato a definir (recorte vertical tipo carta, fondo neutro).

### Dirección elegida: Transmisión de TV
Elegida por el usuario entre las tres sorteadas.
Idea: "En esta página, **la noche de partidos de La Mansion en el Garden** se convierte en
**una transmisión en vivo**: previa, marcador, formación presentada uno por uno, gráficos de stats."
Test del competidor: el resto de las páginas de stats son tablas; esta es la previa de *su* partido,
con *su* estadio, *sus* colores y *su* última noche.
Live thing: la presentación del plantel (carrusel tipo formación inicial) que avanza solo,
con el lower third de cada jugador; y el resumen "Última noche" que cambia con cada tanda.
Estrategia de color: comprometida. Ground negro de la camiseta, tinta blanca de la alternativa,
acento verde de la camiseta. El rojo de la tercera solo para derrotas (dato, no decoración).
Oscuro porque: se mira de noche, después de jugar, y es el lenguaje del broadcast.
Tipografía: una sola familia, Archivo variable (ancho 62–125 %): ultra condensada y pesada para
la gráfica de TV (marcadores, nombres, números), ancho normal para el texto.
Firma de interacción: cortinilla verde que barre cada título al entrar; ticker de resultados;
números que corren como en el marcador; carrusel de formación con barra de progreso.
