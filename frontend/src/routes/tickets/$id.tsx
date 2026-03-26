import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ticketsApi, commentsApi } from "../../lib/api";
import type { Ticket, CommentWithAuthor, TicketStatus } from "../../lib/types";
import { StatusBadge, PriorityBadge } from "../../components/StatusBadge";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/tickets/$id")({
  component: TicketDetailPage,
});

const NEXT_STATUS: Partial<Record<TicketStatus, TicketStatus>> = {
  abierto: "en_progreso",
  en_progreso: "resuelto",
  resuelto: "cerrado",
};

const NEXT_LABEL: Partial<Record<TicketStatus, string>> = {
  abierto: "Iniciar progreso",
  en_progreso: "Marcar como resuelto",
  resuelto: "Cerrar ticket",
};

const CATEGORY_LABEL: Record<string, string> = {
  hardware: "Hardware",
  software: "Software",
  red: "Red",
  accesos: "Accesos",
  otro: "Otro",
};

function TicketDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const load = () => {
    ticketsApi.get(id).then(setTicket).catch((e) => setError(e.message));
    commentsApi.list(id).then(setComments).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatusChange = async () => {
    if (!ticket) return;
    const next = NEXT_STATUS[ticket.status];
    if (!next) return;
    setActionLoading(true);
    try {
      const updated = await ticketsApi.updateStatus(id, next);
      setTicket(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    setActionLoading(true);
    try {
      const updated = await ticketsApi.assign(id);
      setTicket(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await commentsApi.create(id, newComment.trim());
      setNewComment("");
      commentsApi.list(id).then(setComments);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCommentLoading(false);
    }
  };

  if (!ticket) {
    return (
      <div className="text-center text-gray-400 py-12">
        {error || "Cargando..."}
      </div>
    );
  }

  const isAgent = user?.role === "agente";
  const nextStatus = NEXT_STATUS[ticket.status];
  const isAssignedToMe = ticket.assignedTo === user?.id;
  const canAssign = isAgent && !ticket.assignedTo && ticket.status !== "cerrado";
  const canChangeStatus = isAgent && isAssignedToMe && !!nextStatus;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate({ to: "/tickets" })}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← Volver a tickets
      </button>

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">{ticket.title}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4 space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {ticket.description}
        </p>
        <hr className="border-gray-100" />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Categoría</dt>
            <dd className="text-gray-900 font-medium">
              {CATEGORY_LABEL[ticket.category]}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Creado</dt>
            <dd className="text-gray-900 font-medium">
              {new Date(ticket.createdAt).toLocaleString("es")}
            </dd>
          </div>
          {ticket.resolvedAt && (
            <div>
              <dt className="text-gray-500">Resuelto</dt>
              <dd className="text-gray-900 font-medium">
                {new Date(ticket.resolvedAt).toLocaleString("es")}
              </dd>
            </div>
          )}
        </dl>
      </div>

     {(canAssign || canChangeStatus) && (
        <div className="flex gap-3 mb-6">
          {canAssign && (
            <button
              onClick={handleAssign}
              disabled={actionLoading}
              className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              Asignarme este ticket
            </button>
          )}
          {canChangeStatus && (
            <button
              onClick={handleStatusChange}
              disabled={actionLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {NEXT_LABEL[ticket.status]}
            </button>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        <div className="px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Comentarios ({comments.length})
          </h2>
        </div>

        {comments.length === 0 ? (
          <div className="px-5 py-6 text-sm text-gray-400 text-center">
            Sin comentarios aún.
          </div>
        ) : (
          comments.map(({ comment, author }) => (
            <div key={comment.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {author?.name ?? "Usuario"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString("es")}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))
        )}

        {ticket.status !== "cerrado" && (
          <form onSubmit={handleComment} className="px-5 py-4">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Agregar un comentario..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <button
              type="submit"
              disabled={commentLoading || !newComment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {commentLoading ? "Enviando..." : "Comentar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}