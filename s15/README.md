# S15 — Partidos en tiempo real con SSE y migraciones

Aplicación full-stack que muestra eventos de partidos de fútbol en vivo. El administrador registra eventos por HTTP; los espectadores los reciben con **Server-Sent Events**. El esquema de PostgreSQL se versiona con **Drizzle Kit**.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- npm
- PostgreSQL 16+ (local o con Docker)

Puertos fijos: API **3000**, frontend **5173**, Postgres Docker **5433** (evita choque con un Postgres local en 5432).

## Arranque

### 1. Base de datos

Con Docker (si tienes Docker Desktop en marcha):

```bash
cd s15
docker compose up -d
```

Sin Docker, crea usuario y base en tu PostgreSQL local:

```bash
psql -U postgres -c "CREATE ROLE s15 LOGIN PASSWORD 's15';"
psql -U postgres -c "CREATE DATABASE matches OWNER s15;"
```

La URL por defecto en `backend/.env` es `postgresql://s15:s15@localhost:5433/matches`.

### 2. Migraciones

```bash
cd s15/backend
npm install
npm run db:migrate
```

Hay dos migraciones versionadas en `backend/drizzle/`:

| Archivo | Qué hace |
|---------|----------|
| `0000_initial.sql` | Crea enums y tablas `matches` / `events` |
| `0001_add_event_period.sql` | Añade el enum `event_period` y la columna `period` |
| `0002_match_live_fields.sql` | Añade `league`, `kickoff_at` y `minute` al partido |

Comandos de Drizzle Kit:

| Comando | Efecto |
|---------|--------|
| `npm run db:generate` | Genera una nueva migración a partir de cambios en `src/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes a PostgreSQL |
| `npm run db:studio` | Abre Drizzle Studio |

No modifiques el esquema a mano en la base de datos: cambia el schema de Drizzle y genera una migración.

### 3. API y cliente

En una terminal:

```bash
cd s15/backend
npm run start:dev
```

En otra:

```bash
cd s15/frontend
npm install
npm run dev
```

| Superficie | URL |
|------------|-----|
| Vista pública | http://localhost:5173 |
| Administración | http://localhost:5173/admin |
| OpenAPI | http://localhost:3000/docs |

Al primer arranque, si no hay partidos, el backend inserta **dos partidos** de ejemplo con eventos.

## Arquitectura

```
s15/
├── docker-compose.yml
├── backend/
│   ├── drizzle/                 # Migraciones SQL versionadas
│   ├── drizzle.config.ts
│   └── src/
│       ├── db/                  # Schema Drizzle, cliente, seed
│       └── matches/             # HTTP + hub SSE por partido
└── frontend/
    └── src/
        ├── api/                 # fetch + URL del stream
        ├── hooks/useMatchLive.ts
        ├── components/
        └── views/               # Pública y administración
```

## Contrato HTTP

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/matches` | Lista de partidos (tablero) |
| `GET` | `/matches/board/stream` | SSE del tablero: actualiza marcadores de cualquier partido |
| `GET` | `/matches/:id` | Estado actual + historial (orden: minuto, `created_at`) |
| `POST` | `/matches/:id/events` | Registra un evento (valida, persiste, actualiza marcador si es gol, emite SSE) |
| `GET` | `/matches/:id/events/stream` | SSE `text/event-stream` solo de ese partido |

La vista pública muestra un **tablero tipo resultados en vivo** (filtros Todos / En vivo / Próximos / Finalizados). Al abrir un partido se carga el historial por HTTP y luego el stream del partido.

Flujo del cliente:

1. Carga el estado con `GET /matches/:id`.
2. Abre `EventSource` al stream.
3. Deduplica por `id` del evento (evita duplicados tras reconexión).
4. Cierra y limpia el stream al cambiar de partido o salir de la vista.

Estados de conexión visibles: **conectado**, **reconectando**, **desconectado**.

## Tipos de evento

Cada tipo tiene marca y color distintos en la línea de tiempo: gol, falta, cambio, tarjeta amarilla, tarjeta roja.

## Demostración sugerida

1. Abre la vista pública en una pestaña y la administración en otra.
2. Selecciona el mismo partido en ambas; confirma que el público queda **conectado**.
3. Desde admin, registra un gol: el marcador y la línea de tiempo del público se actualizan sin recargar.
4. Recarga el público: el historial y el marcador se recuperan desde la base de datos.
5. Cambia a otro partido: los eventos del primero no aparecen; el stream se cierra y se abre uno nuevo.
