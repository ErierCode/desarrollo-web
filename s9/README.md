# S9 — Pokédex en React + TypeScript

Migración de la Pokédex a una aplicación **React** con **TypeScript** y **Vite**: formulario controlado, debounce, cancelación con `AbortController` y renderizado declarativo de una colección de Pokémon desde [PokéAPI](https://pokeapi.co/).

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- npm

## Instalación y ejecución

```bash
cd s9
npm install
npm run dev
```

Abre la URL que muestre Vite (por defecto [http://localhost:5173](http://localhost:5173)).

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Comprueba tipos y genera `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | Ejecuta oxlint |

## Estructura

```
s9/
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx              # Estado de colección y orquestación de solicitudes
│   ├── App.css
│   ├── index.css
│   ├── types.ts             # Tipos de datos, props y estados de solicitud
│   ├── api/
│   │   └── pokemon.ts       # Acceso a PokéAPI (separado de la UI)
│   ├── hooks/
│   │   └── useDebouncedValue.ts
│   └── components/
│       ├── SearchForm.tsx   # Formulario controlado + submit
│       ├── RequestStatus.tsx
│       ├── PokemonList.tsx  # map + claves estables (id)
│       └── PokemonCard.tsx
└── README.md
```

## Componentes

1. **SearchForm** — input controlado y evento `submit`.
2. **RequestStatus** — mensajes de idle / loading / success / empty / error.
3. **PokemonList** — colección con `map` y `key={pokemon.id}`.
4. **PokemonCard** — presentación de un ejemplar (nombre, peso, imagen).

## Qué implementa

- **Colección en estado** — cada búsqueda exitosa por nombre añade un Pokémon; se evita duplicar por `id`.
- **Filtros combinables** — tipo, generación y rareza (legendarios / míticos / ambos), con paginación de 50.
- **Paginación** — Anterior / Siguiente al explorar con filtros.
- **Debounce** — la escritura no dispara una petición por tecla (~450 ms).
- **AbortController** — al cambiar la consulta o los filtros se cancela la solicitud anterior; las cancelaciones no se muestran como errores de red.
- **Sin DOM imperativo** — no se usa `getElementById`, `innerHTML` ni creación manual de tarjetas.
- **Accesibilidad** — labels asociados, `role="status"` / `aria-live`, foco visible y navegación por teclado.

## Estados de interfaz

| Estado | Cuándo |
|--------|--------|
| **idle** | Arranque o campo vacío |
| **loading** | Solicitud en curso |
| **success** | Pokémon encontrado (nuevo o ya en la lista) |
| **empty** | PokéAPI responde 404 / sin coincidencia |
| **error** | Fallo de red u otra respuesta inesperada |

## API

- Base: `https://pokeapi.co/api/v2/pokemon/{nombre-o-id}`
- Documentación: https://pokeapi.co/docs/v2#pokemon
