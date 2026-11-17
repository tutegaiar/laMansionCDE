# La Mansion CDE · Stats

Página con las estadísticas del club en Clubes Pro (EA SPORTS FC), usando la API no oficial que usa ea.com.

- **Resumen**: récord, goles, racha, últimos resultados y líderes.
- **Plantel**: tabla ordenable con las stats de cada jugador.
- **Partidos**: historial completo (se va guardando, EA solo muestra los últimos 10 por tipo) con detalle por partido.
- **Jugador**: perfil con foto, totales, gráfico de rating y sus partidos.

## Cómo funciona

EA (Akamai) **bloquea las IPs de Vercel** (`403 Access Denied`), así que el pedido a EA
lo hace un script chico desde una compu con IP común, y le manda los datos a la página:

```
compu prendida (cron cada 30 min)                 Vercel
scripts/ea-sync.mjs ──► API de EA                  /api/ingest ──► Neon Postgres
        └──────────── POST con los datos ────────────►              │
                                                              páginas (cacheadas)
```

`/api/sync` (Vercel le pega directo a EA) queda por si algún día EA deja de bloquear.

## Deploy

1. **Vercel** → importar el repo y deployar.
2. **Neon**: *Storage → Create Database → Neon* (región US East), conectarla al proyecto. Crea `DATABASE_URL` sola.
3. **Secreto**: agregar `CRON_SECRET` en *Environment Variables*.
4. **Redeploy** (las variables nuevas solo aplican a deploys nuevos).

## Script de sync (`scripts/ea-sync.mjs`)

Necesita Node 18+ y nada más. Probarlo a mano:

```bash
SITE_URL=https://la-mansion-cde.vercel.app CRON_SECRET=tu_secret node scripts/ea-sync.mjs
```

Tiene que terminar con `HTTP 200 ... "ok":true`.

**Linux (server, VM, Raspberry)** — `crontab -e`:

```
*/30 * * * * cd /ruta/al/repo && SITE_URL=https://la-mansion-cde.vercel.app CRON_SECRET=tu_secret /usr/bin/node scripts/ea-sync.mjs >> /var/log/ea-sync.log 2>&1
```

**Windows** — Programador de tareas → Crear tarea → Desencadenador "Diariamente, repetir cada 30 minutos" → Acción:

- Programa: `powershell`
- Argumentos: `-NoProfile -Command "$env:SITE_URL='https://la-mansion-cde.vercel.app'; $env:CRON_SECRET='tu_secret'; node C:\ruta\al\repo\scripts\ea-sync.mjs"`

EA solo guarda los últimos 10 partidos por tipo: mientras la compu corra el script al menos
una vez cada 10 partidos, no se pierde nada.

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
