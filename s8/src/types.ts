/** Publicación tal como la expone JSONPlaceholder. */
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/** Valores leídos del formulario de búsqueda. */
export interface SearchFormValues {
  userId: number;
  keyword: string;
}

/** Estados visibles de la interfaz. */
export type UiState = "idle" | "loading" | "success" | "empty" | "error";
