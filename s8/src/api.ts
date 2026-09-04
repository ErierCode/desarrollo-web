import type { Post } from "./types.js";

const API_BASE = "https://jsonplaceholder.typicode.com";

/**
 * Obtiene las publicaciones de un usuario desde JSONPlaceholder.
 * Lanza un error si la respuesta HTTP no es exitosa.
 */
export async function fetchPostsByUserId(userId: number): Promise<Post[]> {
  const url = `${API_BASE}/posts?userId=${encodeURIComponent(String(userId))}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`La API respondió con el estado ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("La respuesta de la API no tiene el formato esperado.");
  }

  return data.map(normalizePost);
}

function normalizePost(item: unknown): Post {
  if (item === null || typeof item !== "object") {
    throw new Error("Se recibió un elemento de publicación inválido.");
  }

  const record = item as Record<string, unknown>;

  if (
    typeof record.userId !== "number" ||
    typeof record.id !== "number" ||
    typeof record.title !== "string" ||
    typeof record.body !== "string"
  ) {
    throw new Error("Una publicación no coincide con el modelo esperado.");
  }

  return {
    userId: record.userId,
    id: record.id,
    title: record.title,
    body: record.body,
  };
}
