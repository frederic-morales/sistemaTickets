# Sistema de Tickets de Soporte

Sistema interno de gestión de tickets de soporte técnico. Proyecto full-stack construido con **Bun + Hono + Drizzle** en el backend y **React + Vite + TanStack Router** en el frontend.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Bun, Hono, Drizzle ORM, Better Auth |
| Frontend | React 19, Vite 6, TanStack Router, Tailwind CSS v3 |
| Base de datos | PostgreSQL 15 |
| Infraestructura | Docker, Docker Compose |

---

## Requisitos previos

- [Bun](https://bun.sh) >= 1.1
- [Docker](https://www.docker.com) >= 24
- [Docker Compose](https://docs.docker.com/compose) >= 2

---

## Opción A — Levantar con Docker Compose (recomendado)

Esta opción levanta los 3 servicios (PostgreSQL + Backend + Frontend) con un solo comando.

**1. Clonar el repositorio:**
```bash
git clone https://github.com/frederic-morales/sistemaTickets
cd sistemaTickets
```

**2. Configurar variables de entorno del backend:**
```bash
cd backend
cp .env.example .env
```

El archivo `.env` debe quedar así:
```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/support_tickets
BETTER_AUTH_SECRET=supersecreto1234567890123456789012
BETTER_AUTH_URL=http://localhost:3000
PORT=3000
```

> El host en `DATABASE_URL` es `postgres` (nombre del servicio en Docker Compose), no `localhost`.

**3. Levantar todos los servicios:**
```bash
cd ../docker
docker compose up --build
```

Las migraciones se ejecutan automáticamente al iniciar el backend.

**4. Verificar que los servicios están corriendo:**
```
✔ Container postgres-tickets   Running
✔ Container backend-tickets    Running
✔ Container frontend-tickets   Running
```

**5. Acceder a la aplicación:**
- Frontend: `http://localhost`
- Backend: `http://localhost:3000`

**6. Cargar datos de prueba (opcional):**
```bash
docker exec -it backend-tickets bun run seed
```

Credenciales generadas:
```
Agente:   agente@test.com   / password123
Empleado: empleado@test.com / password123
```

---

## Opción B — Ejecutar localmente 
(PostgreSQL en Docker, backend y frontend con Bun)

### 1. Levantar PostgreSQL con Docker

```bash
cd docker
docker compose up postgres -d
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env
```

El archivo `.env` debe quedar así:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/support_tickets
BETTER_AUTH_SECRET=supersecreto1234567890123456789012
BETTER_AUTH_URL=http://localhost:3000
PORT=3000
```

> El host en `DATABASE_URL` es `localhost` cuando corrés el backend fuera de Docker.

```bash
bun install
```

### 3. Ejecutar migraciones

```bash
bun run db:migrate
```

Deberías ver:
```
[✓] migrations applied successfully!
```

### 4. Cargar datos de prueba (opcional)

```bash
bun run seed
```

Credenciales generadas:
```
Agente:   agente@test.com   / password123
Empleado: empleado@test.com / password123
```

### 5. Iniciar el backend

```bash
bun run dev
# Servidor corriendo en http://localhost:3000
```

### 6. Configurar e iniciar el frontend

En una nueva terminal:

```bash
cd frontend
bun install
bun run dev
# Servidor corriendo en http://localhost:5173
```

---

## Ejecutar tests

Con el backend corriendo localmente:

```bash
cd backend
bun test
```

Output esperado:
```
✓ Tickets API > POST /tickets — empleado puede crear un ticket
✓ Tickets API > POST /tickets — falla con campos inválidos
✓ Tickets API > PATCH /tickets/:id/assign — empleado no puede asignarse un ticket
✓ Tickets API > PATCH /tickets/:id/status — agente no asignado no puede cambiar estado
✓ Tickets API > PATCH /tickets/:id/status — transición inválida de estado

5 pass | 0 fail
```

---

## Estructura del proyecto

```
pruebaTecnica_tickets/
├── .github/
│   └── workflows/
│       └── test.yml              # CI — corre tests en cada push
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts         # Schema Drizzle con enums
│   │   │   ├── index.ts          # Conexión PostgreSQL
│   │   │   └── migrations/       # Migraciones generadas por drizzle-kit
│   │   ├── routes/
│   │   │   ├── tickets.ts        # CRUD tickets + asignación + cambio de estado
│   │   │   ├── comments.ts       # Comentarios por ticket
│   │   │   └── dashboard.ts      # Métricas agregadas en SQL
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Extrae sesión y la pone en contexto Hono
│   │   │   └── requireRole.ts    # Middleware de rol composable
│   │   ├── lib/
│   │   │   └── auth.ts           # Configuración de Better Auth
│   │   ├── types.ts              # Tipos compartidos del contexto Hono
│   │   └── index.ts              # Entry point — Hono app
│   ├── src/tests/
│   │   └── tickets.test.ts       # 5 tests de endpoints críticos
│   ├── seed.ts                   # Script de datos de prueba
│   ├── drizzle.config.ts         # Configuración de Drizzle Kit
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   └── src/
│       ├── routes/
│       │   ├── __root.tsx        # Layout global + auth guard
│       │   ├── index.tsx         # Redirección a /tickets
│       │   ├── login.tsx         # Vista de login
│       │   ├── register.tsx      # Vista de registro
│       │   ├── dashboard.tsx     # Vista de métricas
│       │   └── tickets/
│       │       ├── index.tsx     # Listado con filtros
│       │       ├── new.tsx       # Formulario de creación
│       │       └── $id.tsx       # Detalle + comentarios + acciones
│       ├── components/
│       │   ├── Navbar.tsx        # Barra de navegación
│       │   ├── StatusBadge.tsx   # Badges de estado y prioridad
│       │   └── TicketFilters.tsx # Filtros del listado
│       └── lib/
│           ├── api.ts            # Cliente HTTP centralizado
│           ├── auth.tsx          # AuthContext + useAuth hook
│           └── types.ts          # Tipos e interfaces compartidos
├── docker/
│   └── docker-compose.yml        # PostgreSQL + Backend + Frontend
└── README.md
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://postgres:password@localhost:5432/support_tickets` |
| `BETTER_AUTH_SECRET` | Clave secreta para firmar sesiones (mín. 32 chars) | `supersecreto1234567890123456789012` |
| `BETTER_AUTH_URL` | URL base del backend | `http://localhost:3000` |
| `PORT` | Puerto del servidor | `3000` |

---

## Decisiones técnicas

### Por qué `pgEnum` en Drizzle y no strings libres
Los enums de PostgreSQL rechazan valores inválidos a nivel de motor de base de datos, no solo en la aplicación. Si alguien inserta un status `"abiertoo"` por error, PostgreSQL lo rechaza sin que el backend intervenga. Además, Drizzle infiere los tipos TypeScript automáticamente desde el enum, eliminando una clase entera de bugs en tiempo de compilación.

### Por qué `text` en lugar de `uuid` para los IDs
Better Auth genera IDs en formato string (`5A88ex1vxYLJWpHLktvaAIZK9R98CanU`) que no son UUIDs estándar. Forzar el tipo `uuid` de PostgreSQL causaba errores de validación al registrar usuarios. Cambiamos a `text` con `$defaultFn(() => crypto.randomUUID())` para mantener la generación automática de IDs únicos sin el conflicto de tipos.

### Por qué `accounts` separado de `users`
Better Auth separa la identidad del usuario (`users`) de sus credenciales (`accounts`). Esto permite agregar múltiples métodos de autenticación al mismo usuario sin cambiar el schema — por ejemplo, login con email/password y con Google corporativo para el mismo empleado. La contraseña se guarda hasheada con bcrypt en `accounts.password`, nunca en `users`.

### Por qué `additionalFields` para el rol
Better Auth maneja por defecto solo `name`, `email` y `emailVerified`. Con `additionalFields` le decimos que `role` es un campo extra que se persiste en `users` y se puede enviar al momento del registro. Sin esto, habría que hacer una segunda query después del registro para asignar el rol.

### Por qué `trustedOrigins` en Better Auth
Better Auth implementa protección CSRF por defecto y rechaza peticiones de orígenes no registrados. `trustedOrigins` es la lista blanca de dominios permitidos. Incluimos tanto `http://localhost:5173` (desarrollo local) como `http://localhost` (Docker con Nginx en puerto 80).

### Por qué Better Auth en lugar de auth manual
Implementar autenticación correctamente implica hashear contraseñas, generar tokens seguros, manejar expiración de sesiones y proteger contra CSRF y timing attacks. Better Auth resuelve todo esto con configuración mínima. Para un sistema interno de soporte, construir auth desde cero no agrega valor al negocio — agrega superficie de ataque.

### Por qué las transiciones de estado viven en el backend
La lógica `abierto → en_progreso → resuelto → cerrado` está en `routes/tickets.ts`. Si estuviera solo en el frontend, cualquier petición directa a la API podría saltar estados. El backend es la única fuente de verdad para las reglas de negocio.

### Por qué solo el agente asignado puede cambiar el estado
Un agente solo puede cambiar el estado de un ticket si está asignado a él. Esto evita que múltiples agentes interfieran en el mismo ticket y garantiza trazabilidad — siempre se sabe quién es responsable de cada cambio.

### Por qué `resolved_at` se llena automáticamente
Cuando el status cambia a `"resuelto"`, el handler setea `resolvedAt: new Date()` en la misma operación de update. Si dependiera del cliente, el timestamp podría ser incorrecto o manipulado. Este campo es la base del cálculo de promedio de resolución en el dashboard.

### Por qué el promedio de resolución se calcula en SQL
```sql
AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)
```
Calcular esto en JavaScript requeriría traer todos los tickets resueltos al servidor de aplicación. Con SQL, el cómputo ocurre en la base de datos y solo viaja el resultado. Para 10,000 tickets la diferencia de performance es significativa.

### Por qué `requireRole` es un middleware composable
```ts
app.patch("/:id/assign", requireAuth, requireRole("agente"), handler)
```
Tener `requireRole("agente")` como función que devuelve un middleware permite aplicarlo de forma declarativa en la definición de la ruta. El lector entiende los permisos sin tener que inspeccionar el handler.

### Por qué TanStack Router con file-based routing
El plugin de Vite escanea `src/routes/` y genera el árbol de rutas automáticamente, eliminando el boilerplate de registrar rutas manualmente. La convención `$id.tsx` para rutas dinámicas es explícita y alineada con la documentación oficial.

### Por qué el auth guard está en `__root.tsx`
Centralizar la verificación de sesión en el layout raíz garantiza que ninguna ruta quede desprotegida por omisión. Con `beforeLoad` en el root, cualquier ruta nueva hereda la protección automáticamente sin necesidad de recordar agregarlo.

### Por qué `fetch` nativo en lugar de Axios
`fetch` viene incluido en el navegador y en Bun — sin dependencias extra. La función `request` centraliza el manejo de errores y headers sin necesitar una librería externa. Axios resolvía problemas de compatibilidad de browsers que ya no son relevantes en 2026.

