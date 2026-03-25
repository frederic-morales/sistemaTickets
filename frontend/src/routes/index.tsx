import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tailwind funciona
        </h1>
        <p className="text-gray-500">Sistema de tickets de soporte</p>
      </div>
    </div>
  ),
});