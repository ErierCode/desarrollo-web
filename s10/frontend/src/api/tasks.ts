import type { Task, TaskMutationBody } from "../types";

export const API_BASE_URL = "http://localhost:3000";
export const DOCS_URL = `${API_BASE_URL}/docs`;

export class ApiError extends Error {
  readonly statusCode: number;
  readonly messages: string[];

  constructor(statusCode: number, messages: string[]) {
    super(messages.join(" "));
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.messages = messages;
  }
}

interface ErrorPayload {
  message?: unknown;
}

interface ApiSuccess<T> {
  status: number;
  data: T;
}

export function readFailure(error: unknown): {
  statusCode: number | null;
  messages: string[];
} {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode === 0 ? null : error.statusCode,
      messages: error.messages,
    };
  }

  return {
    statusCode: null,
    messages: ["Ocurrió un error inesperado al llamar a la API."],
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const result = await request<Task[]>("/tasks");
  return result.data;
}

export function createTask(body: TaskMutationBody): Promise<ApiSuccess<Task>> {
  return request<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTask(id: string, body: TaskMutationBody): Promise<ApiSuccess<Task>> {
  return request<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteTask(id: string): Promise<number> {
  const result = await request<void>(`/tasks/${id}`, { method: "DELETE" });
  return result.status;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiSuccess<T>> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, [
      "No se pudo conectar con la API. Comprueba que el backend esté en ejecución en el puerto 3000.",
    ]);
  }

  if (response.status === 204) {
    return { status: response.status, data: undefined as T };
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, readMessages(payload, response.status));
  }

  return { status: response.status, data: payload as T };
}

function readMessages(payload: unknown, status: number): string[] {
  if (isErrorPayload(payload)) {
    const { message } = payload;
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message;
    }
    if (typeof message === "string" && message.length > 0) {
      return [message];
    }
  }

  return [`La API respondió ${status} sin un mensaje legible.`];
}

function isErrorPayload(value: unknown): value is ErrorPayload {
  return typeof value === "object" && value !== null;
}
