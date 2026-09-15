import type { PaginationProps } from "../types";

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <nav className="pagination" aria-label="Paginación de Pokémon">
      <p className="pagination-summary">
        Mostrando {start}–{end} de {totalItems}
      </p>
      <div className="pagination-controls">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          Anterior
        </button>
        <p className="pagination-page" aria-live="polite">
          Página {page} de {totalPages}
        </p>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
