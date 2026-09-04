import { fetchPostsByUserId } from "./api.js";
import type { Post, SearchFormValues, UiState } from "./types.js";

const form = requireElement<HTMLFormElement>("#search-form");
const submitButton = requireElement<HTMLButtonElement>("#submit-button");
const statusEl = requireElement<HTMLParagraphElement>("#status");
const resultsEl = requireElement<HTMLUListElement>("#results");

let isLoading = false;

form.addEventListener("submit", (event: SubmitEvent) => {
  void handleSubmit(event);
});

async function handleSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  if (isLoading) {
    return;
  }

  const values = readFormValues(new FormData(form));
  if (!values) {
    setUiState("error", "Revisa los datos del formulario e inténtalo de nuevo.");
    return;
  }

  isLoading = true;
  setLoading(true);
  setUiState("loading", "Buscando publicaciones…");
  clearResults();

  try {
    const posts = await fetchPostsByUserId(values.userId);
    const filtered = filterByKeyword(posts, values.keyword);

    if (filtered.length === 0) {
      setUiState(
        "empty",
        "Sin resultados: no hay publicaciones que coincidan con tu búsqueda."
      );
      return;
    }

    renderResults(filtered);
    setUiState(
      "success",
      `Éxito: se encontraron ${filtered.length} publicación(es).`
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ocurrió un error inesperado al consultar la API.";
    setUiState("error", `Error: ${message}`);
  } finally {
    isLoading = false;
    setLoading(false);
  }
}

function readFormValues(formData: FormData): SearchFormValues | null {
  const userIdRaw = String(formData.get("userId") ?? "").trim();
  const keyword = String(formData.get("keyword") ?? "").trim();
  const userId = Number(userIdRaw);

  if (!Number.isInteger(userId) || userId < 1 || userId > 10) {
    return null;
  }

  return { userId, keyword };
}

function filterByKeyword(posts: Post[], keyword: string): Post[] {
  if (keyword.length === 0) {
    return posts;
  }

  const needle = keyword.toLocaleLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLocaleLowerCase().includes(needle) ||
      post.body.toLocaleLowerCase().includes(needle)
  );
}

function renderResults(posts: Post[]): void {
  clearResults();

  for (const post of posts) {
    const item = document.createElement("li");
    item.className = "result-item";

    const title = document.createElement("h3");
    title.className = "result-title";
    title.textContent = post.title;

    const meta = document.createElement("p");
    meta.className = "result-meta";
    meta.textContent = `Usuario #${post.userId} · Publicación #${post.id}`;

    const body = document.createElement("p");
    body.className = "result-body";
    body.textContent = post.body;

    item.append(title, meta, body);
    resultsEl.appendChild(item);
  }
}

function clearResults(): void {
  while (resultsEl.firstChild) {
    resultsEl.removeChild(resultsEl.firstChild);
  }
}

function setLoading(loading: boolean): void {
  submitButton.disabled = loading;
  submitButton.textContent = loading ? "Buscando…" : "Buscar publicaciones";
}

function setUiState(state: UiState, message: string): void {
  statusEl.dataset.state = state;
  statusEl.textContent = message;
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`No se encontró el elemento ${selector} en el DOM.`);
  }
  return element;
}

setUiState(
  "idle",
  "Estado inicial: elige un usuario (1–10) y, si quieres, una palabra clave."
);
