import { useEffect, useState } from "react";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  draftFromTask,
  emptyDraft,
  type Task,
  type TaskDraft,
} from "../types";

interface TaskFormProps {
  editing: Task | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (draft: TaskDraft) => void;
}

export function TaskForm({ editing, isSaving, onCancel, onSubmit }: TaskFormProps) {
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);

  useEffect(() => {
    setDraft(editing ? draftFromTask(editing) : emptyDraft());
  }, [editing]);

  function updateDraft<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]): void {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="task-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isSaving) {
          onSubmit(draft);
        }
      }}
    >
      <div className="form-heading">
        <h2 id="form-title">{editing ? "Editar tarea" : "Nueva tarea"}</h2>
        <p>
          {editing
            ? "Los cambios se envían con PATCH y la tarjeta usa la tarea que devuelve la API."
            : "El alta se envía con POST. El tablero solo añade la tarea que confirma el servidor."}
        </p>
        <p className="hint">
          Un título de menos de 3 caracteres, o la prioridad vacía, responde 400. Un título
          repetido responde 409.
        </p>
      </div>

      <label>
        Título
        <input
          name="title"
          value={draft.title}
          maxLength={120}
          disabled={isSaving}
          onChange={(event) => updateDraft("title", event.target.value)}
        />
      </label>

      <label>
        Descripción
        <textarea
          name="description"
          rows={4}
          value={draft.description}
          disabled={isSaving}
          onChange={(event) => updateDraft("description", event.target.value)}
        />
      </label>

      <div className="form-row">
        <label>
          Prioridad
          <select
            name="priority"
            value={draft.priority}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft("priority", event.target.value as TaskDraft["priority"])
            }
          >
            <option value="">Selecciona una prioridad</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABEL[priority]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estado
          <select
            name="status"
            value={draft.status}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft("status", event.target.value as TaskDraft["status"])
            }
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Fecha límite
        <input
          name="dueDate"
          type="date"
          value={draft.dueDate}
          disabled={isSaving}
          onChange={(event) => updateDraft("dueDate", event.target.value)}
        />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando…" : editing ? "Guardar cambios" : "Crear tarea"}
        </button>
        {editing ? (
          <button type="button" className="secondary" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
