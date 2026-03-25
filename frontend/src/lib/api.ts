import type {
  AppUser,
  Ticket,
  TicketWithCreator,
  TicketStatus,
  CommentWithAuthor,
  CreateTicketInput,
  DashboardData,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Error desconocido");
  }

  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request("/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    request("/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  logout: () => request("/auth/sign-out", { method: "POST" }),

  session: () => request<{ user: AppUser } | null>("/auth/get-session"),
};

export const ticketsApi = {
  list: (filters?: Record<string, string>) => {
    const qs = filters ? "?" + new URLSearchParams(filters).toString() : "";
    return request<TicketWithCreator[]>(`/tickets${qs}`);
  },

  get: (id: string) => request<Ticket>(`/tickets/${id}`),

  create: (data: CreateTicketInput) =>
    request<Ticket>("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: TicketStatus) =>
    request<Ticket>(`/tickets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  assign: (id: string) =>
    request<Ticket>(`/tickets/${id}/assign`, { method: "PATCH" }),
};

export const commentsApi = {
  list: (ticketId: string) =>
    request<CommentWithAuthor[]>(`/tickets/${ticketId}/comments`),

  create: (ticketId: string, content: string) =>
    request<Comment>(`/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

export const dashboardApi = {
  get: () => request<DashboardData>("/dashboard"),
};