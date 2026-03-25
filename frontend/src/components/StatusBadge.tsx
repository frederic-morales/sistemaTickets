import type { TicketStatus, Priority } from "../lib/types";

const STATUS_STYLES: Record<TicketStatus, string> = {
  abierto: "bg-blue-100 text-blue-800",
  en_progreso: "bg-yellow-100 text-yellow-800",
  resuelto: "bg-green-100 text-green-800",
  cerrado: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  abierto: "Abierto",
  en_progreso: "En progreso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  critica: "bg-red-100 text-red-800",
  alta: "bg-orange-100 text-orange-800",
  media: "bg-yellow-100 text-yellow-800",
  baja: "bg-gray-100 text-gray-700",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}