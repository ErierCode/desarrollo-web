import { useCallback, useEffect, useRef, useState } from "react";
import {
  describeBrowseFilters,
  fetchPokemonByQuery,
  fetchPokemonGenerations,
  fetchPokemonPageByFilters,
  fetchPokemonTypes,
  hasActiveBrowseFilters,
  PAGE_SIZE,
  PokemonNotFoundError,
  RequestAbortedError,
  type BrowseFilters,
  type FilterOption,
  type RarityFilter,
} from "./api/pokemon";
import { SearchForm } from "./components/SearchForm";
import { RequestStatus } from "./components/RequestStatus";
import { PokemonList } from "./components/PokemonList";
import { Pagination } from "./components/Pagination";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type { Pokemon, RequestStatusInfo } from "./types";
import "./App.css";

const DEBOUNCE_MS = 450;

const IDLE_STATUS: RequestStatusInfo = {
  kind: "idle",
  message:
    "Estado inicial: busca por nombre o combina tipo, generación y rareza.",
};

const EMPTY_FILTERS: BrowseFilters = {
  type: "",
  generation: "",
  rarity: "",
};

function App() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<BrowseFilters>(EMPTY_FILTERS);
  const [types, setTypes] = useState<FilterOption[]>([]);
  const [generations, setGenerations] = useState<FilterOption[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [generationsLoading, setGenerationsLoading] = useState(true);
  const [collection, setCollection] = useState<Pokemon[]>([]);
  const [browseResults, setBrowseResults] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<RequestStatusInfo>(IDLE_STATUS);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const abortRef = useRef<AbortController | null>(null);
  const skipNextDebounceRef = useRef(false);
  const typesRef = useRef(types);
  const generationsRef = useRef(generations);
  const browsing = hasActiveBrowseFilters(filters);

  typesRef.current = types;
  generationsRef.current = generations;

  const beginRequest = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller;
  }, []);

  const searchPokemon = useCallback(
    async (rawQuery: string, options?: { force?: boolean }) => {
      const trimmed = rawQuery.trim();

      if (browsing && !options?.force) {
        return;
      }

      if (trimmed.length === 0) {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsLoading(false);
        setStatus(IDLE_STATUS);
        return;
      }

      const controller = beginRequest();
      setIsLoading(true);
      setStatus({
        kind: "loading",
        message: `Buscando «${trimmed}» en PokéAPI…`,
      });

      try {
        const pokemon = await fetchPokemonByQuery(trimmed, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        let wasDuplicate = false;
        setCollection((prev) => {
          if (prev.some((entry) => entry.id === pokemon.id)) {
            wasDuplicate = true;
            return prev;
          }
          return [...prev, pokemon];
        });

        setStatus({
          kind: "success",
          message: wasDuplicate
            ? `«${pokemon.name}» ya estaba en tu Pokédex (sin duplicar).`
            : `Se añadió «${pokemon.name}» (#${pokemon.id}) a la colección.`,
        });
      } catch (error) {
        if (error instanceof RequestAbortedError || controller.signal.aborted) {
          return;
        }

        if (error instanceof PokemonNotFoundError) {
          setStatus({
            kind: "empty",
            message: `Sin resultados: ${error.message}`,
          });
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al consultar PokéAPI.";

        setStatus({
          kind: "error",
          message: `Error: ${message}`,
        });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [beginRequest, browsing]
  );

  const loadBrowsePage = useCallback(
    async (nextFilters: BrowseFilters, nextPage: number) => {
      if (!hasActiveBrowseFilters(nextFilters)) {
        return;
      }

      const controller = beginRequest();
      const label = describeBrowseFilters(
        nextFilters,
        typesRef.current,
        generationsRef.current
      );
      const rarityOnly =
        !nextFilters.type &&
        !nextFilters.generation &&
        Boolean(nextFilters.rarity);

      setIsLoading(true);
      setStatus({
        kind: "loading",
        message: rarityOnly
          ? `Preparando listado de ${label} (puede tardar la primera vez)…`
          : `Cargando ${label} (página ${nextPage})…`,
      });

      try {
        const result = await fetchPokemonPageByFilters(
          nextFilters,
          nextPage,
          PAGE_SIZE,
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        setBrowseResults(result.pokemon);
        setPage(result.page);
        setTotalItems(result.total);
        setTotalPages(result.totalPages);

        if (result.total === 0 || result.pokemon.length === 0) {
          setStatus({
            kind: "empty",
            message: `Sin resultados para ${label}.`,
          });
          return;
        }

        setStatus({
          kind: "success",
          message: `${label}: ${result.total} Pokémon. Página ${result.page} de ${result.totalPages} (${PAGE_SIZE} por página).`,
        });
      } catch (error) {
        if (error instanceof RequestAbortedError || controller.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al consultar PokéAPI.";

        setStatus({
          kind: "error",
          message: `Error: ${message}`,
        });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [beginRequest]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadFilterOptions() {
      setTypesLoading(true);
      setGenerationsLoading(true);

      try {
        const [typeOptions, generationOptions] = await Promise.all([
          fetchPokemonTypes(controller.signal),
          fetchPokemonGenerations(controller.signal),
        ]);

        if (!controller.signal.aborted) {
          setTypes(typeOptions);
          setGenerations(generationOptions);
        }
      } catch (error) {
        if (error instanceof RequestAbortedError || controller.signal.aborted) {
          return;
        }
        setStatus({
          kind: "error",
          message:
            "Error: no se pudieron cargar los filtros. Recarga la página.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setTypesLoading(false);
          setGenerationsLoading(false);
        }
      }
    }

    void loadFilterOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }

    void searchPokemon(debouncedQuery);
  }, [debouncedQuery, searchPokemon]);

  useEffect(() => {
    if (!hasActiveBrowseFilters(filters)) {
      setBrowseResults([]);
      setPage(1);
      setTotalItems(0);
      setTotalPages(1);
      return;
    }

    void loadBrowsePage(filters, 1);
  }, [filters, loadBrowsePage]);

  function handleSubmit() {
    skipNextDebounceRef.current = true;
    if (browsing) {
      setFilters(EMPTY_FILTERS);
    }
    void searchPokemon(query, { force: true });
  }

  function updateFilters(patch: Partial<BrowseFilters>) {
    const next = { ...filters, ...patch };
    setFilters(next);

    if (hasActiveBrowseFilters(next)) {
      setQuery("");
    } else {
      setStatus(IDLE_STATUS);
    }
  }

  function handlePageChange(nextPage: number) {
    if (!browsing || nextPage < 1 || nextPage > totalPages) {
      return;
    }
    void loadBrowsePage(filters, nextPage);
  }

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const visiblePokemon = browsing ? browseResults : collection;

  return (
    <main className="stage">
      <header className="head">
        <p className="eyebrow">S9</p>
        <h1>Pokédex</h1>
        <p className="lede">
          Filtra por tipo, generación y rareza, o arma tu colección por nombre.
        </p>
      </header>

      <SearchForm
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        types={types}
        selectedType={filters.type}
        onTypeChange={(type) => updateFilters({ type })}
        typesLoading={typesLoading}
        generations={generations}
        selectedGeneration={filters.generation}
        onGenerationChange={(generation) => updateFilters({ generation })}
        generationsLoading={generationsLoading}
        selectedRarity={filters.rarity}
        onRarityChange={(rarity: RarityFilter) => updateFilters({ rarity })}
      />

      <RequestStatus status={status} />

      {browsing ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
          disabled={isLoading}
        />
      ) : null}

      <PokemonList pokemon={visiblePokemon} />

      {browsing ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
          disabled={isLoading}
        />
      ) : null}
    </main>
  );
}

export default App;
