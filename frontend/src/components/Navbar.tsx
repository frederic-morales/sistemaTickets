import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/tickets" className="font-semibold text-gray-900 text-lg">
          Soporte
        </Link>
        <Link
          to="/tickets"
          className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-medium [&.active]:text-blue-600"
        >
          Tickets
        </Link>
        <Link
          to="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-medium [&.active]:text-blue-600"
        >
          Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {user?.name}{" "}
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {user?.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}