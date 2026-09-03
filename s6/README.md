# S6 — Catálogo de libros con TypeScript

Proyecto TypeScript reproducible que modela un pequeño catálogo de libros. Demuestra configuración estricta del compilador, tipos, funciones con parámetros y retornos explícitos, y módulos con importaciones/exportaciones.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (incluido con Node.js)

## Instalación

```bash
cd s6
npm install
```

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run typecheck` | Verifica tipos sin generar archivos de salida |
| `npm run build` | Compila `src/` hacia `dist/` con mapas de código fuente |
| `npm start` | Ejecuta la aplicación compilada (`node dist/index.js`) |

Flujo recomendado:

```bash
npm run typecheck
npm run build
npm start
```

## Estructura del proyecto

```
s6/
├── src/
│   ├── models.ts    # Tipos e interfaces del dominio
│   ├── catalog.ts   # Datos y funciones de negocio
│   └── index.ts     # Punto de entrada de la aplicación
├── dist/            # Salida generada por tsc (no versionada)
├── package.json
├── tsconfig.json
└── README.md
```

## Dominio: catálogo de libros

El dominio representa una librería con títulos clasificados por categoría (`fiction`, `science`, `history`, `technology`). Cada libro tiene identificador, título, autor, número de páginas, precio y disponibilidad.

**Archivos y responsabilidades:**

- `models.ts` — Define la interfaz `Book` y el alias `BookCategory`.
- `catalog.ts` — Contiene el arreglo tipado `books` y tres funciones:
  - `filterByCategory` — filtra libros por categoría.
  - `calculateTotalValue` — suma el precio de una lista de libros.
  - `formatBookSummary` — transforma un libro en una cadena legible.
- `index.ts` — Orquesta la ejecución: muestra el catálogo, agrupa por categoría y presenta un resumen de inventario y valor.

La aplicación se ejecuta en terminal e imprime el catálogo, los libros por categoría y estadísticas de stock y valor total.
