interface Filters {
  status: string;
  priority: string;
  category: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function TicketFilters({ filters, onChange }: Props) {
  const set =
    (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
      onChange({ ...filters, [key]: e.target.value });

  const selectClass =
    "border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        className={selectClass}
        value={filters.status}
        onChange={set("status")}
      >
        <option value="">Todos los estados</option>
        <option value="abierto">Abierto</option>
        <option value="en_progreso">En progreso</option>
        <option value="resuelto">Resuelto</option>
        <option value="cerrado">Cerrado</option>
      </select>

      <select
        className={selectClass}
        value={filters.priority}
        onChange={set("priority")}
      >
        <option value="">Todas las prioridades</option>
        <option value="critica">Crítica</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>

      <select
        className={selectClass}
        value={filters.category}
        onChange={set("category")}
      >
        <option value="">Todas las categorías</option>
        <option value="hardware">Hardware</option>
        <option value="software">Software</option>
        <option value="red">Red</option>
        <option value="accesos">Accesos</option>
        <option value="otro">Otro</option>
      </select>

      {(filters.status || filters.priority || filters.category) && (
        <button
          onClick={() => onChange({ status: "", priority: "", category: "" })}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}