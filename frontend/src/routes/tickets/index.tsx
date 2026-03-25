import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ticketsApi } from "../../lib/api";
import type { TicketWithCreator } from "../../lib/types";
import { StatusBadge, PriorityBadge } from "../../components/StatusBadge";
import { TicketFilters } from "../../components/TicketFilters";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/tickets/")({
  component: TicketsPage,
});

function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });

  useEffect(() => {
    setLoading(true);
    const active = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v)
    );
    ticketsApi
      .list(active)
      .then(setTickets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
        <Link
          to="/tickets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Nuevo ticket
        </Link>
      </div>

      <div className="mb-4">
        <TicketFilters filters={filters} onChange={setFilters} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Cargando...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No hay tickets con esos filtros.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {tickets.map(({ ticket, creator }) => (
            <Link
              key={ticket.id}
              to="/tickets/$id"
              params={{ id: ticket.id }}
              className="flex items-start justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {ticket.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ticket.category} ·{" "}
                  {new Date(ticket.createdAt).toLocaleDateString("es")}
                  {user?.role === "agente" && creator && (
                    <> · {creator.name}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}