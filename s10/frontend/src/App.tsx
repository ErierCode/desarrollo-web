import { useCallback, useEffect, useState } from "react";
import { DOCS_URL, createTask, deleteTask, fetchTasks, readFailure, updateTask } from "./api/tasks";
import { Feedback } from "./components/Feedback";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import {
  draftToBody,
  formatHttpStatus,
  type MutationState,
  type Task,
  type TaskDraft,
} from "./types";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string[] | null>(null);
  const [mutation, setMutation] = useState<MutationState>({ kind: "idle" });
  const [editing, setEditing] = useState<Task | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const collection = await fetchTasks();
      setTasks(byNewest(collection));
    } catch (error) {
      setLoadError(readFailure(error).messages);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleSubmit(draft: TaskDraft): Promise<void> {
    setMutation({ kind: "saving" });
    setConfirmingId(null);
    try {
      const body = draftToBody(draft);
      if (editing) {
        const updated = await updateTask(editing.id, body);
        setTasks((current) =>
          current.map((task) => (task.id === updated.data.id ? updated.data : task)),
        );
        setEditing(null);
        setMutation({
          kind: "success",
          statusCode: updated.status,
          message: `Tarea actualizada: ${updated.data.title}`,
        });
        return;
      }

      const created = await createTask(body);
      setTasks((current) => byNewest([...current, created.data]));
      setFormKey((key) => key + 1);
      setMutation({
        kind: "success",
        statusCode: created.status,
        message: `Tarea creada: ${created.data.title}`,
      });
    } catch (error) {
      const failure = readFailure(error);
      setMutation({ kind: "error", ...failure });
    }
  }

  async function handleConfirmDelete(task: Task): Promise<void> {
    setMutation({ kind: "deleting", taskId: task.id });
    try {
      const status = await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      if (editing?.id === task.id) {
        setEditing(null);
      }
      setConfirmingId(null);
      setMutation({
        kind: "success",
        statusCode: status,
        message: `Tarea eliminada: ${task.title}`,
      });
    } catch (error) {
      const failure = readFailure(error);
      setMutation({ kind: "error", ...failure });
      if (failure.statusCode === 404) {
        setConfirmingId(null);
        void loadTasks();
      }
    }
  }

  const isSaving = mutation.kind === "saving";
  const deletingId = mutation.kind === "deleting" ? mutation.taskId : null;

  return (
    <>
      <header className="site-header">
        <div>
          <p className="eyebrow">API HTTP · NestJS + React</p>
          <h1>Tareas</h1>
          <p className="lede">
            El tablero muestra la colección, crea con un formulario y actualiza o elimina
            solo cuando la API confirma la operación.
          </p>
        </div>
        <a className="docs-link" href={DOCS_URL} target="_blank" rel="noreferrer">
          Ver contrato OpenAPI
        </a>
      </header>

      <main className="layout">
        <section className="panel form-panel" aria-labelledby="form-title">
          <MutationFeedback state={mutation} />
          <TaskForm
            key={editing?.id ?? `new-${formKey}`}
            editing={editing}
            isSaving={isSaving}
            onCancel={() => setEditing(null)}
            onSubmit={(draft) => {
              void handleSubmit(draft);
            }}
          />
        </section>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          loadError={loadError}
          editingId={editing?.id ?? null}
          confirmingId={confirmingId}
          deletingId={deletingId}
          actionsLocked={isSaving || deletingId !== null}
          onRetry={() => {
            void loadTasks();
          }}
          onEdit={(task) => {
            setConfirmingId(null);
            setEditing(task);
          }}
          onAskDelete={(taskId) => setConfirmingId(taskId)}
          onConfirmDelete={(task) => {
            void handleConfirmDelete(task);
          }}
          onCancelDelete={() => setConfirmingId(null)}
        />
      </main>
    </>
  );
}

function byNewest(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function MutationFeedback({ state }: { state: MutationState }) {
  if (state.kind === "saving") {
    return <Feedback kind="loading" heading="Enviando la petición…" />;
  }
  if (state.kind === "deleting") {
    return <Feedback kind="loading" heading="Eliminando la tarea…" />;
  }
  if (state.kind === "success") {
    return (
      <Feedback
        kind="success"
        heading={`${formatHttpStatus(state.statusCode)} · ${state.message}`}
      />
    );
  }
  if (state.kind === "error") {
    return (
      <Feedback
        kind="error"
        heading={
          state.statusCode
            ? `${formatHttpStatus(state.statusCode)} · La API rechazó la operación`
            : "Sin conexión · No hubo respuesta de la API"
        }
        messages={state.messages}
      />
    );
  }
  return null;
}

export default App;
