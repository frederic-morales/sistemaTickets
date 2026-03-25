export type Role = "empleado" | "agente";
export type TicketStatus = "abierto" | "en_progreso" | "resuelto" | "cerrado";
export type Priority = "critica" | "alta" | "media" | "baja";
export type Category = "hardware" | "software" | "red" | "accesos" | "otro";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface TicketWithCreator {
  ticket: Ticket;
  creator: { id: string; name: string; email: string } | null;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface CommentWithAuthor {
  comment: Comment;
  author: { id: string; name: string } | null;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}

export interface DashboardData {
  byStatus: { status: TicketStatus; count: number }[];
  byPriority: { priority: Priority; count: number }[];
  avgResolutionHours: number;
  unassignedOlderThan48h: number;
  recentTickets: Ticket[];
}