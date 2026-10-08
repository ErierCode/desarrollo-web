# S10 — API HTTP de tareas con NestJS y React

API validada y un cliente que consume su contrato. Los datos viven en memoria: no hay base de datos. La demostración cubre la arquitectura del módulo, la semántica HTTP, la validación y el manejo de errores.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- npm

Los puertos están fijos. La API escucha en **3000** y el navegador debe abrirse en **http://localhost:5173**. CORS solo admite ese origen.

## Instalación y ejecución

En una terminal:

```bash
cd s10/backend
npm install
npm run start:dev
```

En otra:

```bash
cd s10/frontend
npm install
npm run dev
```

| Superficie | URL |
|------------|-----|
| Interfaz | http://localhost:5173 |
| OpenAPI (Swagger UI) | http://localhost:3000/docs |
| Especificación JSON | http://localhost:3000/docs-json |

Al reiniciar el backend se pierden los cambios y vuelven las tres tareas iniciales.

| Comando | Dónde | Qué hace |
|---------|--------|----------|
| `npm run start:dev` | `backend` | API en caliente |
| `npm run build` | `backend` | Compila a `dist/` |
| `npm run start:prod` | `backend` | Ejecuta `dist/main.js` |
| `npm run dev` | `frontend` | Vite en el puerto 5173 |
| `npm run build` | `frontend` | Comprueba tipos y genera `dist/` |

## Arquitectura

```
s10/
├── backend/src/
│   ├── main.ts                          # ValidationPipe, CORS, OpenAPI
│   ├── config.ts                        # Puerto 3000 y origen del frontend
│   ├── app.module.ts
│   ├── common/
│   │   ├── api-exception.filter.ts      # Misma forma para todos los errores
│   │   └── validation-exception.factory.ts
│   └── tasks/
│       ├── tasks.module.ts
│       ├── tasks.controller.ts          # Verbos y códigos HTTP
│       ├── tasks.service.ts             # Reglas y almacenamiento en memoria
│       ├── task.entity.ts
│       ├── task.enums.ts
│       └── dto/                         # Alta, cambio parcial y reemplazo
└── frontend/src/
    ├── api/tasks.ts                     # Cliente del contrato
    ├── App.tsx                          # Orquesta la colección confirmada
    └── components/                      # Formulario, lista, estados
```

El controlador devuelve el recurso, o nada en el borrado, y Nest asigna el código. Los fallos salen de `BadRequestException`, `NotFoundException` y `ConflictException`.

## Recurso

`Task`:

| Campo | Quién lo escribe | Regla |
|-------|------------------|--------|
| `id` | Servidor | UUID v4 |
| `title` | Cliente | Texto, 3 a 80 caracteres, único sin distinguir mayúsculas |
| `description` | Cliente | Texto, hasta 500 caracteres. Vacía si no se envía en el alta |
| `priority` | Cliente | `baja`, `media` o `alta` |
| `status` | Cliente | `pendiente`, `en_curso` o `hecha`. En el alta, si se omite, queda `pendiente` |
| `dueDate` | Cliente | Día real `AAAA-MM-DD`, o `null` |
| `createdAt`, `updatedAt` | Servidor | ISO 8601 |

Enviar `id`, `createdAt`, `updatedAt` u otra propiedad desconocida responde **400**: el pipe tiene `whitelist` y `forbidNonWhitelisted`. `transform` instancia el DTO y recorta los textos antes de validar. No convierte un número en texto: un tipo incorrecto también es 400.

## Rutas

| Método | Ruta | Éxito | Errores |
|--------|------|-------|---------|
| `GET` | `/tasks` | **200** colección | — |
| `GET` | `/tasks/:id` | **200** recurso | **400** id no UUID v4, **404** no existe |
| `POST` | `/tasks` | **201** recurso creado | **400** datos inválidos, **409** título repetido |
| `PATCH` | `/tasks/:id` | **200** recurso ya modificado | **400**, **404**, **409** |
| `PUT` | `/tasks/:id` | **200** recurso reemplazado | **400**, **404**, **409** |
| `DELETE` | `/tasks/:id` | **204** sin cuerpo | **400**, **404** |

`PUT` es el reemplazo completo. `title`, `description`, `priority` y `status` son obligatorios. Si `dueDate` no viene, queda `null`: no se conserva la fecha anterior. `id` y `createdAt` sí se conservan.

`PATCH` solo cambia los campos enviados. Un cuerpo vacío responde **400**.

## Códigos de estado

| Código | Cuándo |
|--------|--------|
| **200 OK** | `GET`, `PATCH` y `PUT` devuelven la representación actual |
| **201 Created** | `POST` creó la tarea y devuelve esa representación |
| **204 No Content** | `DELETE` terminó; no hay cuerpo que leer |
| **400 Bad Request** | Falta un dato, el tipo o el formato no valen, el id no es UUID v4, sobra una propiedad o el `PATCH` no trae campos |
| **404 Not Found** | El UUID es válido y no hay una tarea con ese id |
| **409 Conflict** | El título ya pertenece a otra tarea |

Un **500** queda fuera de esta demostración: el filtro solo lo emitiría si el proceso fallara de verdad.

Todo error usa el mismo cuerpo. `message` es siempre una lista:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": ["Ya existe una tarea con el título \"Preparar la demostración\""]
}
```

## Interfaz

La pantalla carga `GET /tasks` y distingue carga, éxito y error.

- **Crear** hace `POST` y añade la tarea devuelta, con el título ya normalizado por el servidor.
- **Editar** hace `PATCH` y sustituye la tarjeta por el recurso de la respuesta.
- **Eliminar** espera el **204** y solo entonces quita la tarjeta. Si el servidor responde **404**, vuelve a pedir la colección.

## Ejemplos

Alta válida:

```powershell
curl.exe -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Cerrar la demo","priority":"alta","dueDate":"2026-10-31"}'
```

Título repetido (**409**):

```powershell
curl.exe -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Preparar la demostración","priority":"baja"}'
```

Propiedad desconocida (**400**):

```powershell
curl.exe -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Otra tarea","priority":"baja","owner":"ada"}'
```

Reemplazo completo con `PUT`. Si `dueDate` se omite, la fecha queda vacía:

```powershell
curl.exe -i -X PUT http://localhost:3000/tasks/6f0c9a2e-1b7d-4c3a-8e91-0a5b2c7d4e18 -H "Content-Type: application/json" -d '{"title":"Demostración cerrada","description":"Reemplazo completo","priority":"alta","status":"hecha"}'
```
