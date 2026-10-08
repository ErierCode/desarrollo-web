import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  formatDueDate,
  formatTimestamp,
  type Task,
} from "../types";

interface TaskCardProps {
  task: Task;
  isEditing: boolean;
  isConfirming: boolean;
  isDeleting: boolean;
  actionsLocked: boolean;
  onEdit: (task: Task) => void;
  onAskDelete: (taskId: string) => void;
  onConfirmDelete: (task: Task) => void;
  onCancelDelete: () => void;
}

export function TaskCard({
  task,
  isEditing,
  isConfirming,
  isDeleting,
  actionsLocked,
  onEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: TaskCardProps) {
  return (
    <article className="task-card" data-status={task.status} aria-busy={isDeleting}>
      <header className="task-card-head">
        <h3>{task.title}</h3>
        <div className="badges">
          <span className="badge" data-priority={task.priority}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          <span className="badge" data-status={task.status}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>
      </header>

      {task.description ? <p className="description">{task.description}</p> : null}

      <dl className="meta">
        <div>
          <dt>Fecha límite</dt>
          <dd>{task.dueDate ? formatDueDate(task.dueDate) : "Sin fecha"}</dd>
        </div>
        <div>
          <dt>Actualizada</dt>
          <dd>{formatTimestamp(task.updatedAt)}</dd>
        </div>
      </dl>

      <p className="task-id">
        <span>Id</span>
        <code>{task.id}</code>
      </p>

      {isConfirming ? (
        <div className="confirm">
          <p>¿Eliminar esta tarea? La API debe responder 204.</p>
          <div className="form-actions">
            <button
              type="button"
              className="danger"
              disabled={actionsLocked}
              onClick={() => onConfirmDelete(task)}
            >
              {isDeleting ? "Eliminando…" : "Confirmar"}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={actionsLocked}
              onClick={onCancelDelete}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="form-actions">
          <button
            type="button"
            className="secondary"
            aria-pressed={isEditing}
            disabled={actionsLocked}
            onClick={() => onEdit(task)}
          >
            Editar
          </button>
          <button
            type="button"
            className="danger"
            disabled={actionsLocked}
            onClick={() => onAskDelete(task.id)}
          >
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}
