export const PRIORITIES = ["baja", "media", "alta"] as const;
export const STATUSES = ["pendiente", "en_curso", "hecha"] as const;

export type TaskPriority = (typeof PRIORITIES)[number];
export type TaskStatus = (typeof STATUSES)[number];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  hecha: "Hecha",
};

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDraft {
  title: string;
  description: string;
  priority: TaskPriority | "";
  status: TaskStatus;
  dueDate: string;
}

export interface TaskMutationBody {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string | null;
}

export type MutationState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "deleting"; taskId: string }
  | { kind: "success"; statusCode: number; message: string }
  | { kind: "error"; statusCode: number | null; messages: string[] };

export function emptyDraft(): TaskDraft {
  return {
    title: "",
    description: "",
    priority: "",
    status: "pendiente",
    dueDate: "",
  };
}

export function draftFromTask(task: Task): TaskDraft {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ?? "",
  };
}

export function draftToBody(draft: TaskDraft): TaskMutationBody {
  return {
    title: draft.title,
    description: draft.description,
    priority: draft.priority,
    status: draft.status,
    dueDate: draft.dueDate === "" ? null : draft.dueDate,
  };
}

export function formatDueDate(value: string): string {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
}

export function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const HTTP_STATUS_TEXT: Record<number, string> = {
  200: "200 OK",
  201: "201 Created",
  204: "204 No Content",
  400: "400 Bad Request",
  404: "404 Not Found",
  409: "409 Conflict",
};

export function formatHttpStatus(statusCode: number): string {
  return HTTP_STATUS_TEXT[statusCode] ?? String(statusCode);
}
