# La Mansion CDE · Stats

Página con las estadísticas del club en Clubes Pro (EA SPORTS FC), usando la API no oficial que usa ea.com.

- **Resumen**: récord, goles, racha, últimos resultados y líderes.
- **Plantel**: tabla ordenable con las stats de cada jugador.
- **Partidos**: historial completo (se va guardando, EA solo muestra los últimos 10 por tipo) con detalle por partido.
- **Jugador**: perfil con foto, totales, gráfico de rating y sus partidos.

## Cómo funciona

```
cron-job.org (cada 30 min) ──► /api/sync ──► API de EA
                                   │
                                   ▼
                          Neon Postgres (historial)
                                   │
                                   ▼
                        páginas (cacheadas, nunca le pegan a EA)
```

## Deploy

1. **Vercel** → *Add New → Project* → importar este repo → Deploy (va a salir vacío, es normal).
2. **Base**: en el proyecto de Vercel → *Storage → Create Database → Neon* → conectarla al proyecto. Eso crea `DATABASE_URL` sola.
3. **Secreto**: *Settings → Environment Variables* → agregar `CRON_SECRET` con un valor largo al azar. Hacer *Redeploy*.
4. **Primera carga**: abrir `https://TU-PAGINA.vercel.app/api/sync?key=TU_CRON_SECRET`. Tiene que responder `"ok": true`. Las tablas se crean solas.
5. **Cron**: en [cron-job.org](https://cron-job.org) crear un job:
   - URL: `https://TU-PAGINA.vercel.app/api/sync`
   - Cada 30 minutos
   - *Advanced → Headers*: `Authorization: Bearer TU_CRON_SECRET`

Si `/api/sync` devuelve errores tipo `HTTP 403` / `Access Denied` es que EA está bloqueando a Vercel. Avisá y lo movemos a un server propio.

## Personalizar

Todo en `src/lib/config.ts`:

- `divisionOverride`: división actual a mano (los rankings de EA tardan en actualizarse). `null` para usar la de EA.
- `crest`: escudo (subir la imagen a `public/` y poner la ruta, ej. `"/crest.png"`).
- `players`: por gamertag, `alias` (nombre a mostrar) y `photo`. Las fotos van en `public/players/`, por ejemplo una captura del Pro.

```ts
export const players = {
  "Jarnkonungr": { photo: "/players/jarnkonungr.jpg" },
  "f3233d8859b432db": { alias: "Nombre del jugador" },
};
```

**El ID del club cambia con cada FC nuevo.** Si deja de traer datos, buscarlo en
`https://proclubs.ea.com/api/fc/allTimeLeaderboard/search?platform=common-gen5&clubName=La%20Mansion%20CDE`
y actualizar `clubId`.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # DATABASE_URL de un Postgres local o de Neon
python3 scripts/make-fixtures.py   # datos de prueba (con EA_MOCK=1)
npm run dev
curl "localhost:3000/api/sync?key=$CRON_SECRET"
```
