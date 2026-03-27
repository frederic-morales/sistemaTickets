/**
 * Seed script — genera datos de prueba
 * Uso: bun run seed.ts
 */
import { db } from "./src/db";
import { users, tickets, comments } from "./src/db/schema";
import { auth } from "./src/lib/auth";

async function seed() {
  console.log("Iniciando seed...");

  // Crear usuario agente
  const agentRes = await auth.api.signUpEmail({
    body: {
      name: "Ana Agente",
      email: "agente@test.com",
      password: "password123",
      role: "agente",
    },
  });
  console.log("Agente creado:", agentRes.user.email);

  // Crear usuario empleado
  const employeeRes = await auth.api.signUpEmail({
    body: {
      name: "Carlos Empleado",
      email: "empleado@test.com",
      password: "password123",
      role: "empleado",
    },
  });
  console.log("Empleado creado:", employeeRes.user.email);

  const agentId = agentRes.user.id;
  const employeeId = employeeRes.user.id;

  // Crear tickets de prueba
  const sampleTickets = [
    {
      title: "PC no enciende en oficina 3",
      description: "La computadora del puesto 3B no enciende desde esta mañana. Se escucha un pitido al intentar prenderla.",
      category: "hardware" as const,
      priority: "alta" as const,
      status: "abierto" as const,
      createdBy: employeeId,
    },
    {
      title: "Sin acceso a VPN",
      description: "No puedo conectarme a la VPN corporativa desde ayer. El cliente muestra error de autenticación.",
      category: "accesos" as const,
      priority: "critica" as const,
      status: "en_progreso" as const,
      createdBy: employeeId,
      assignedTo: agentId,
    },
    {
      title: "Excel no abre archivos .xlsx",
      description: "Microsoft Excel muestra error al intentar abrir cualquier archivo .xlsx. Reinstalé el Office pero persiste.",
      category: "software" as const,
      priority: "media" as const,
      status: "resuelto" as const,
      createdBy: employeeId,
      assignedTo: agentId,
      resolvedAt: new Date(),
    },
    {
      title: "Conexión de red intermitente",
      description: "La red wifi en la sala de reuniones pierde conexión cada 15 minutos aproximadamente.",
      category: "red" as const,
      priority: "alta" as const,
      status: "abierto" as const,
      createdBy: employeeId,
    },
    {
      title: "Solicitud de acceso a repositorio",
      description: "Necesito acceso de escritura al repositorio de configuraciones para poder realizar cambios aprobados.",
      category: "accesos" as const,
      priority: "baja" as const,
      status: "cerrado" as const,
      createdBy: employeeId,
      assignedTo: agentId,
      resolvedAt: new Date(),
    },
  ];

  const createdTickets = await db
    .insert(tickets)
    .values(sampleTickets)
    .returning();

  console.log(`${createdTickets.length} tickets creados`);

  // Agregar comentarios al segundo ticket
  await db.insert(comments).values([
    {
      ticketId: createdTickets[1].id,
      userId: agentId,
      content: "Revisé el servidor de VPN. Parece ser un problema de certificados expirados. Estoy trabajando en renovarlos.",
    },
    {
      ticketId: createdTickets[1].id,
      userId: employeeId,
      content: "Gracias. ¿Cuándo estiman que estará resuelto? Tengo una reunión importante mañana.",
    },
  ]);

  console.log("Comentarios agregados");
  console.log("\nCredenciales de prueba:");
  console.log("   Agente  → agente@test.com / password123");
  console.log("   Empleado → empleado@test.com / password123");
  console.log("\nSeed completado!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Error en seed:", e);
  process.exit(1);
});
