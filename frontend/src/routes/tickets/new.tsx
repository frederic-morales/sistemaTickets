import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ticketsApi } from "../../lib/api";
import type { CreateTicketInput } from "../../lib/types";
import toast from "react-hot-toast";

export const Route = createFileRoute("/tickets/new")({
  component: NewTicketPage,
});

function NewTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateTicketInput>({
    title: "",
    description: "",
    category: "software",
    priority: "media",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setInput =
  (key: keyof CreateTicketInput) =>
  (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const setTextarea =
    (key: keyof CreateTicketInput) =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const setSelect =
    (key: keyof CreateTicketInput) =>
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ticket = await ticketsApi.create(form);
      toast.success("Ticket creado correctamente");
      navigate({ to: "/tickets/$id", params: { id: ticket.id } });
    } catch (err: any) {
      setError(err.message ?? "Error al crear el ticket");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Nuevo ticket
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            required
            minLength={3}
            value={form.title}
            onChange={setInput("title")}
            className={inputClass}
            placeholder="Describe brevemente el problema"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            required
            minLength={10}
            rows={4}
            value={form.description}
            onChange={setTextarea("description")}
            className={inputClass}
            placeholder="Describe el problema con el mayor detalle posible"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select value={form.category} onChange={setSelect("category")} className={inputClass}>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="red">Red</option>
              <option value="accesos">Accesos</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select value={form.priority} onChange={setSelect("priority")} className={inputClass}>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creando..." : "Crear ticket"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/tickets" })}
            className="px-5 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}