import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { dashboardApi } from "../lib/api";
import type { DashboardData } from "../lib/types";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.get().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-400 py-12">
        Cargando métricas...
      </div>
    );
  }

  const totalTickets = data.byStatus.reduce((acc, s) => acc + s.count, 0);
  const statusMap = Object.fromEntries(
    data.byStatus.map((s) => [s.status, s.count])
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total tickets" value={totalTickets} />
        <StatCard
          label="Promedio resolución"
          value={`${data.avgResolutionHours}h`}
          sub="de abierto a resuelto"
        />
        <StatCard
          label="Sin asignar +48h"
          value={data.unassignedOlderThan48h}
          sub="tickets abiertos sin agente"
        />
        <StatCard label="Resueltos" value={statusMap["resuelto"] ?? 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Por estado
          </h2>
          <div className="space-y-3">
            {data.byStatus.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <div className="flex items-center gap-3 flex-1 mx-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: totalTickets
                          ? `${(count / totalTickets) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-6 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Por prioridad
          </h2>
          <div className="space-y-3">
            {data.byPriority.map(({ priority, count }) => (
              <div key={priority} className="flex items-center justify-between">
                <PriorityBadge priority={priority} />
                <div className="flex items-center gap-3 flex-1 mx-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full"
                      style={{
                        width: totalTickets
                          ? `${(count / totalTickets) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-6 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            Tickets recientes
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {data.recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <p className="text-sm text-gray-900 truncate flex-1 mr-4">
                {ticket.title}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}