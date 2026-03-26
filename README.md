# Sistema de Tickets de Soporte

Sistema interno de gestión de tickets de soporte técnico. Proyecto full-stack construido con Bun + Hono + Drizzle en el backend y React + Vite + TanStack Router en el frontend.

## Requisitos

- [Bun](https://bun.sh) >= 1.1
- PostgreSQL >= 15

## Instalación y ejecución

### 1. Clonar y configurar entorno

```bash
git clone <repo-url>
cd support-tickets
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu DATABASE_URL y BETTER_AUTH_SECRET
bun install
```
 
### 3. Crear la base de datos y ejecutar migraciones

```bash
# Crear la DB en PostgreSQL
createdb support_tickets

# Generar y aplicar migraciones
bun run db:generate
bun run db:migrate
```

### 4. Cargar datos de prueba (opcional)

```bash
bun run seed
# Credenciales generadas:
#   Agente:   agente@test.com   / password123
#   Empleado: empleado@test.com / password123
```

### 5. Iniciar el backend

```bash
bun run dev
# Corre en http://localhost:3000
```

### 6. Configurar e iniciar el frontend

```bash
cd ../frontend
bun install
bun run dev
# Corre en http://localhost:5173
```

## Estructura del proyecto

```
support-tickets/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts        # Schema Drizzle con enums (clave del proyecto)
│   │   │   ├── index.ts         # Conexión PostgreSQL via Pool
│   │   │   └── migrations/      # Migraciones generadas por drizzle-kit
│   │   ├── routes/
│   │   │   ├── tickets.ts       # CRUD tickets + asignación + cambio de estado
│   │   │   ├── comments.ts      # Comentarios por ticket
│   │   │   └── dashboard.ts     # Métricas agregadas (SQL puro)
│   │   ├── middleware/
│   │   │   ├── auth.ts          # Extrae sesión → c.set("user", ...)
│   │   │   └── requireRole.ts   # Middleware de rol composable
│   │   ├── lib/
│   │   │   └── auth.ts          # Instancia de Better Auth
│   │   └── index.ts             # Entry point Hono
│   ├── seed.ts                  # Datos de prueba
│   └── drizzle.config.ts
└── frontend/
    └── src/
        ├── routes/
        │   ├── __root.tsx        # Layout + auth guard global
        │   ├── login.tsx
        │   ├── register.tsx
        │   ├── dashboard.tsx
        │   └── tickets/
        │       ├── index.tsx     # Listado con filtros
        │       ├── new.tsx       # Formulario de creación
        │       └── $id.tsx       # Detalle + comentarios + acciones
        ├── components/
        │   ├── Navbar.tsx
        │   ├── StatusBadge.tsx
        │   └── TicketFilters.tsx
        └── lib/
            ├── api.ts            # Cliente HTTP centralizado + tipos
            └── auth.ts           # AuthContext + useAuth hook
```

## Variables de entorno

Ver `backend/.env.example`:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `BETTER_AUTH_SECRET` | Clave secreta para firmar sesiones (mín. 32 chars) |
| `BETTER_AUTH_URL` | URL base del backend |
| `PORT` | Puerto del servidor (default: 3000) |

## Decisiones técnicas

### Por qué `pgEnum` en Drizzle y no strings libres
Los enums de PostgreSQL hacen que la base de datos rechace valores inválidos a nivel de motor, no solo en la aplicación. Si alguien inserta un status `"abiertoo"` por error, PostgreSQL lo rechaza sin que el backend intervenga. Además, Drizzle infiere los tipos TypeScript automáticamente desde el enum, lo que elimina una clase entera de bugs en tiempo de compilación.

### Por qué la validación de transiciones de estado está en el backend
La lógica de `abierto → en_progreso → resuelto → cerrado` vive en `routes/tickets.ts` y no en el frontend. Si estuviera solo en el cliente, cualquier petición directa a la API podría saltar estados. El backend es la única fuente de verdad para las reglas de negocio.

### Por qué `resolved_at` se llena automáticamente
Cuando el status cambia a `"resuelto"`, el handler setea `resolvedAt: new Date()` en la misma operación de update. Esto garantiza que el timestamp sea preciso y no dependa de que el cliente lo envíe. La query de promedio de resolución en dashboard usa este campo directamente en SQL.

### Por qué el promedio de resolución se calcula en SQL
```sql
AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)
```
Calcular esto en JavaScript requeriría traer todos los tickets resueltos al servidor de aplicación y hacer el cálculo en memoria. Con SQL, el cómputo ocurre en la base de datos y solo viaja el resultado. Para 10,000 tickets la diferencia es significativa.

### Por qué `requireRole` es un middleware separado y composable
```ts
app.patch("/:id/assign", requireAuth, requireRole("agente"), handler)
```
Tener `requireRole("agente")` como función que devuelve un middleware permite aplicarlo a cualquier ruta de forma declarativa. El lector del código entiende los permisos leyendo la definición de la ruta, sin tener que inspeccionar el handler.

### Por qué TanStack Router con file-based routing
TanStack Router genera el árbol de rutas automáticamente desde la estructura de archivos (via Vite plugin), lo que elimina el boilerplate de registrar rutas manualmente. La convención `$id.tsx` para rutas dinámicas es explícita y alineada con la documentación oficial.

### Por qué el auth guard está en `__root.tsx` y no en cada ruta
Centralizar la verificación de sesión en el layout raíz garantiza que ninguna ruta quede desprotegida por omisión. Si estuviera en cada componente, agregar una ruta nueva sin el guard sería un error silencioso. Con `beforeLoad` en el root, cualquier ruta nueva hereda la protección automáticamente.



### Consultas
select * from accounts
select * from comments
select * from sessions
select * from tickets
select * from users
select * from verifications

