import type { Task } from "../types";
import { Feedback } from "./Feedback";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  loadError: string[] | null;
  editingId: string | null;
  confirmingId: string | null;
  deletingId: string | null;
  actionsLocked: boolean;
  onRetry: () => void;
  onEdit: (task: Task) => void;
  onAskDelete: (taskId: string) => void;
  onConfirmDelete: (task: Task) => void;
  onCancelDelete: () => void;
}

export function TaskList({
  tasks,
  isLoading,
  loadError,
  editingId,
  confirmingId,
  deletingId,
  actionsLocked,
  onRetry,
  onEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: TaskListProps) {
  return (
    <section className="panel" aria-labelledby="collection-title">
      <div className="section-heading">
        <h2 id="collection-title">Colección</h2>
        <p>{isLoading ? "Consultando GET /tasks…" : `${tasks.length} en memoria`}</p>
      </div>

      {isLoading && tasks.length === 0 ? (
        <Feedback kind="loading" heading="Cargando tareas…" />
      ) : null}

      {loadError && tasks.length === 0 ? (
        <div className="stack">
          <Feedback
            kind="error"
            heading="No se pudo leer la colección"
            messages={loadError}
          />
          <button type="button" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      ) : null}

      {!isLoading && !loadError && tasks.length === 0 ? (
        <p className="empty">No hay tareas. Crea la primera con el formulario.</p>
      ) : null}

      {tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                isEditing={editingId === task.id}
                isConfirming={confirmingId === task.id}
                isDeleting={deletingId === task.id}
                actionsLocked={actionsLocked}
                onEdit={onEdit}
                onAskDelete={onAskDelete}
                onConfirmDelete={onConfirmDelete}
                onCancelDelete={onCancelDelete}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
