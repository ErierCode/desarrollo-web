# S8 — Formulario, eventos y API pública

Aplicación de navegador que captura datos con un formulario accesible, gestiona el evento `submit` y consume **JSONPlaceholder** para mostrar publicaciones con estados de interfaz claros.

## API utilizada

- Nombre: [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
- Endpoint: `GET https://jsonplaceholder.typicode.com/posts?userId={id}`
- Documentación: https://jsonplaceholder.typicode.com/guide.html
- Uso en esta app: se consultan las publicaciones de un usuario (IDs 1–10) y, de forma opcional, se filtran en el cliente por una palabra clave en título o cuerpo.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (incluido con Node.js)
- Navegador moderno con soporte de módulos ES

## Instalación y ejecución

```bash
cd s8
npm install
npm run build
npm run serve
```

Abre en el navegador: [http://localhost:3000](http://localhost:3000)

También puedes usar un solo comando:

```bash
npm start
```

| Comando | Descripción |
|---------|-------------|
| `npm run typecheck` | Verifica tipos sin emitir archivos |
| `npm run build` | Compila `src/` a `dist/` |
| `npm run watch` | Recompila al guardar cambios |
| `npm run serve` | Sirve la carpeta del proyecto en el puerto 3000 |
| `npm start` | Compila y levanta el servidor local |

Importante: abre la app mediante el servidor local (no con `file://`), para que los módulos ES y `fetch` funcionen correctamente.

## Estructura

```
s8/
├── index.html      # Marcado semántico y formulario
├── styles.css      # Estilos de la interfaz
├── src/
│   ├── types.ts    # Modelos TypeScript (Post, estados, formulario)
│   ├── api.ts      # fetch + async/await hacia JSONPlaceholder
│   └── main.ts     # Eventos, FormData, renderizado y estados UI
├── dist/           # JavaScript generado por tsc
├── package.json
├── tsconfig.json
└── README.md
```

## Qué implementa

1. **Formulario** — controles con `<label>` asociados, validación nativa (`required`, `min`, `max`, `maxlength`, `pattern`) y lectura de valores con `FormData` en el `submit`.
2. **API** — solicitud con `fetch` y `async/await`, comprobación de `response.ok`, modelado tipado de la respuesta y lista dinámica en el DOM.
3. **Seguridad de render** — los datos externos se insertan con `textContent` (sin `innerHTML`).
4. **Anti-duplicados** — mientras hay una petición en curso, el botón se deshabilita y se ignoran nuevos envíos; tras éxito o error se puede consultar de nuevo.

## Estados de interfaz

| Estado | Cuándo aparece | Mensaje / comportamiento |
|--------|----------------|--------------------------|
| **Inicial (`idle`)** | Al cargar la página | Indica que hay que elegir usuario y, opcionalmente, palabra clave. |
| **Cargando (`loading`)** | Tras un envío válido | Muestra “Buscando…”, deshabilita el botón y evita solicitudes duplicadas. |
| **Éxito (`success`)** | La API responde y hay coincidencias | Lista de publicaciones creada dinámicamente en el DOM. |
| **Sin resultados (`empty`)** | Respuesta OK pero el filtro no deja ítems | Mensaje de “Sin resultados” y lista vacía. |
| **Error (`error`)** | Fallo de red, `response.ok === false` o datos inválidos | Mensaje de error; se puede volver a consultar. |
