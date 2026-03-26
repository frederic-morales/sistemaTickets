import { describe, it, expect, beforeAll } from "bun:test";

const BASE = "http://localhost:3000";

async function registerAndLogin(
  name: string,
  email: string,
  role: string
): Promise<string> {
  await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password: "password123",
      role,
    }),
  });

  const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });

  const cookie = res.headers.get("set-cookie") ?? "";
  return cookie;
}

async function createTicket(cookie: string) {
  const res = await fetch(`${BASE}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      title: "Ticket de prueba",
      description: "Descripción del problema de prueba",
      category: "software",
      priority: "media",
    }),
  });
  return res;
}

describe("Tickets API", () => {
  let empleadoCookie: string;
  let agenteCookie: string;
  let ticketId: string;
  let agenteId: string;

  beforeAll(async () => {
    const ts = Date.now();
    empleadoCookie = await registerAndLogin(
      "Empleado Test",
      `empleado_${ts}@test.com`,
      "empleado"
    );
    agenteCookie = await registerAndLogin(
      "Agente Test",
      `agente_${ts}@test.com`,
      "agente"
    );

    const sessionRes = await fetch(`${BASE}/api/auth/get-session`, {
      headers: { Cookie: agenteCookie },
    });
    const session: any = await sessionRes.json();
    agenteId = session.user.id;
  });

  it("POST /tickets — empleado puede crear un ticket", async () => {
    const res = await createTicket(empleadoCookie);
    const body: any = await res.json();

    expect(res.status).toBe(201);
    expect(body.title).toBe("Ticket de prueba");
    expect(body.status).toBe("abierto");
    expect(body.category).toBe("software");
    expect(body.priority).toBe("media");

    ticketId = body.id;
  });

  it("POST /tickets — falla con campos inválidos", async () => {
    const res = await fetch(`${BASE}/api/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: empleadoCookie,
      },
      body: JSON.stringify({
        title: "ab", 
        description: "corta",
        category: "invalida",
        priority: "media",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("PATCH /tickets/:id/assign — empleado no puede asignarse un ticket", async () => {
    const res = await fetch(`${BASE}/api/tickets/${ticketId}/assign`, {
      method: "PATCH",
      headers: { Cookie: empleadoCookie },
    });

    expect(res.status).toBe(403);
  });

  it("PATCH /tickets/:id/status — agente no asignado no puede cambiar estado", async () => {
    const res = await fetch(`${BASE}/api/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: agenteCookie,
      },
      body: JSON.stringify({ status: "en_progreso" }),
    });

    expect(res.status).toBe(403);
  });

  it("PATCH /tickets/:id/status — transición inválida de estado", async () => {
    await fetch(`${BASE}/api/tickets/${ticketId}/assign`, {
      method: "PATCH",
      headers: { Cookie: agenteCookie },
    });

    const res = await fetch(`${BASE}/api/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: agenteCookie,
      },
      body: JSON.stringify({ status: "resuelto" }),
    });

    const body: any = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toContain("Transición inválida");
  });
});