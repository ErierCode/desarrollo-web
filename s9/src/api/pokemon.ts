import type { Pokemon } from "../types";

const API_BASE = "https://pokeapi.co/api/v2";
export const PAGE_SIZE = 50;

/** Error lanzado cuando la solicitud se cancela a propósito. */
export class RequestAbortedError extends Error {
  constructor() {
    super("Solicitud cancelada");
    this.name = "RequestAbortedError";
  }
}

/** Error cuando PokéAPI no encuentra el nombre consultado. */
export class PokemonNotFoundError extends Error {
  constructor(query: string) {
    super(`No se encontró un Pokémon llamado «${query}».`);
    this.name = "PokemonNotFoundError";
  }
}

export type RarityFilter = "" | "legendary" | "mythical" | "special";

export interface FilterOption {
  name: string;
  label: string;
}

export interface BrowseFilters {
  type: string;
  generation: string;
  rarity: RarityFilter;
}

export interface PokemonPage {
  pokemon: Pokemon[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface NamedApiResource {
  name: string;
  url: string;
}

interface PokeApiPokemonResponse {
  id: number;
  name: string;
  weight: number;
  sprites: {
    other?: {
      "official-artwork"?: {
        front_default?: string | null;
      };
    };
    front_default?: string | null;
  };
}

interface PokeApiNamedListResponse {
  results: NamedApiResource[];
}

interface PokeApiTypeDetailResponse {
  name: string;
  names: Array<{
    name: string;
    language: NamedApiResource;
  }>;
  pokemon: Array<{
    slot: number;
    pokemon: NamedApiResource;
  }>;
}

interface PokeApiGenerationDetailResponse {
  name: string;
  names: Array<{
    name: string;
    language: NamedApiResource;
  }>;
  main_region: NamedApiResource;
  pokemon_species: NamedApiResource[];
}

interface PokeApiSpeciesResponse {
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
}

/** Cache de listados por clave de filtro (antes de paginar). */
const entryListCache = new Map<string, NamedApiResource[]>();
let specialListsPromise: Promise<{
  legendary: NamedApiResource[];
  mythical: NamedApiResource[];
}> | null = null;

/**
 * Consulta un Pokémon por nombre o número en PokéAPI.
 * Acepta AbortSignal para cancelar cuando la búsqueda deja de ser relevante.
 */
export async function fetchPokemonByQuery(
  query: string,
  signal?: AbortSignal
): Promise<Pokemon> {
  const normalized = query.trim().toLowerCase();

  if (normalized.length === 0) {
    throw new Error("Escribe un nombre o número de Pokémon para buscar.");
  }

  return fetchPokemonByUrl(
    `${API_BASE}/pokemon/${encodeURIComponent(normalized)}`,
    signal
  );
}

export function hasActiveBrowseFilters(filters: BrowseFilters): boolean {
  return Boolean(filters.type || filters.generation || filters.rarity);
}

export function describeBrowseFilters(
  filters: BrowseFilters,
  typeOptions: FilterOption[],
  generationOptions: FilterOption[]
): string {
  const parts: string[] = [];

  if (filters.type) {
    const label =
      typeOptions.find((item) => item.name === filters.type)?.label ??
      filters.type;
    parts.push(`tipo ${label}`);
  }

  if (filters.generation) {
    const label =
      generationOptions.find((item) => item.name === filters.generation)
        ?.label ?? filters.generation;
    parts.push(label);
  }

  if (filters.rarity === "legendary") {
    parts.push("legendarios");
  } else if (filters.rarity === "mythical") {
    parts.push("míticos");
  } else if (filters.rarity === "special") {
    parts.push("legendarios y míticos");
  }

  return parts.join(" · ");
}

/** Lista los tipos jugables (1–18) con etiqueta en español cuando exista. */
export async function fetchPokemonTypes(
  signal?: AbortSignal
): Promise<FilterOption[]> {
  const data = await fetchJson<PokeApiNamedListResponse>(
    `${API_BASE}/type?limit=30`,
    signal
  );

  const mainTypes = data.results.filter((entry) => {
    const id = extractIdFromUrl(entry.url);
    return id !== null && id >= 1 && id <= 18;
  });

  const detailed = await Promise.all(
    mainTypes.map(async (entry) => {
      const detail = await fetchJson<PokeApiTypeDetailResponse>(
        entry.url,
        signal
      );
      const spanish =
        detail.names.find((item) => item.language.name === "es")?.name ??
        detail.name;

      return {
        name: detail.name,
        label: spanish,
      };
    })
  );

  return detailed.sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Lista las generaciones con etiqueta en español y región. */
export async function fetchPokemonGenerations(
  signal?: AbortSignal
): Promise<FilterOption[]> {
  const data = await fetchJson<PokeApiNamedListResponse>(
    `${API_BASE}/generation?limit=20`,
    signal
  );

  const detailed = await Promise.all(
    data.results.map(async (entry) => {
      const detail = await fetchJson<PokeApiGenerationDetailResponse>(
        entry.url,
        signal
      );
      const spanish =
        detail.names.find((item) => item.language.name === "es")?.name ??
        detail.name;
      const region = detail.main_region.name.replace(/-/g, " ");

      return {
        name: detail.name,
        label: `${spanish} (${capitalize(region)})`,
      };
    })
  );

  return detailed;
}

/**
 * Obtiene una página de Pokémon según tipo, generación y/o rareza.
 * Pagina de a `pageSize` (50 por defecto).
 */
export async function fetchPokemonPageByFilters(
  filters: BrowseFilters,
  page: number,
  pageSize: number = PAGE_SIZE,
  signal?: AbortSignal
): Promise<PokemonPage> {
  if (!hasActiveBrowseFilters(filters)) {
    throw new Error("Selecciona al menos un filtro para explorar.");
  }

  const cacheKey = buildFilterCacheKey(filters);
  let entries = entryListCache.get(cacheKey);

  if (!entries) {
    entries = await resolveFilterEntries(filters, signal);
    entryListCache.set(cacheKey, entries);
  }

  const safePage = Math.max(1, page);
  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageEntries = entries.slice(start, start + pageSize);

  const pokemon = await Promise.all(
    pageEntries.map((entry) => fetchPokemonByUrl(entry.url, signal))
  );

  return {
    pokemon: dedupeById(pokemon),
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

async function resolveFilterEntries(
  filters: BrowseFilters,
  signal?: AbortSignal
): Promise<NamedApiResource[]> {
  let entries: NamedApiResource[] | null = null;

  if (filters.generation) {
    entries = await fetchGenerationPokemonEntries(filters.generation, signal);
  }

  if (filters.type) {
    const typeEntries = await fetchTypePokemonEntries(filters.type, signal);
    entries = entries
      ? intersectById(entries, typeEntries)
      : typeEntries;
  }

  if (filters.rarity) {
    if (!entries) {
      entries = await fetchRarityPokemonEntries(filters.rarity, signal);
    } else {
      entries = await filterEntriesByRarity(entries, filters.rarity, signal);
    }
  }

  return entries ?? [];
}

async function fetchTypePokemonEntries(
  typeName: string,
  signal?: AbortSignal
): Promise<NamedApiResource[]> {
  const normalized = typeName.trim().toLowerCase();
  const cacheKey = `type:${normalized}`;
  const cached = entryListCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const typeData = await fetchJson<PokeApiTypeDetailResponse>(
    `${API_BASE}/type/${encodeURIComponent(normalized)}`,
    signal
  );
  const entries = dedupeResources(
    typeData.pokemon.map((item) => item.pokemon)
  );
  entryListCache.set(cacheKey, entries);
  return entries;
}

async function fetchGenerationPokemonEntries(
  generationName: string,
  signal?: AbortSignal
): Promise<NamedApiResource[]> {
  const normalized = generationName.trim().toLowerCase();
  const cacheKey = `generation:${normalized}`;
  const cached = entryListCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const generation = await fetchJson<PokeApiGenerationDetailResponse>(
    `${API_BASE}/generation/${encodeURIComponent(normalized)}`,
    signal
  );

  const entries = dedupeResources(
    generation.pokemon_species.map(speciesToPokemonResource)
  );
  entryListCache.set(cacheKey, entries);
  return entries;
}

async function fetchRarityPokemonEntries(
  rarity: Exclude<RarityFilter, "">,
  signal?: AbortSignal
): Promise<NamedApiResource[]> {
  const lists = await getSpecialPokemonLists(signal);

  if (rarity === "legendary") {
    return lists.legendary;
  }
  if (rarity === "mythical") {
    return lists.mythical;
  }
  return dedupeResources([...lists.legendary, ...lists.mythical]);
}

async function filterEntriesByRarity(
  entries: NamedApiResource[],
  rarity: Exclude<RarityFilter, "">,
  signal?: AbortSignal
): Promise<NamedApiResource[]> {
  const matched: NamedApiResource[] = [];

  for (const batch of chunk(entries, 20)) {
    const results = await Promise.all(
      batch.map(async (entry) => {
        const id = extractIdFromUrl(entry.url);
        if (id === null) {
          return null;
        }

        const species = await fetchJson<PokeApiSpeciesResponse>(
          `${API_BASE}/pokemon-species/${id}`,
          signal
        );

        const isLegendary = species.is_legendary;
        const isMythical = species.is_mythical;
        const include =
          (rarity === "legendary" && isLegendary) ||
          (rarity === "mythical" && isMythical) ||
          (rarity === "special" && (isLegendary || isMythical));

        return include ? entry : null;
      })
    );

    for (const item of results) {
      if (item) {
        matched.push(item);
      }
    }
  }

  return dedupeResources(matched);
}

async function getSpecialPokemonLists(signal?: AbortSignal): Promise<{
  legendary: NamedApiResource[];
  mythical: NamedApiResource[];
}> {
  const legendaryCached = entryListCache.get("rarity:legendary");
  const mythicalCached = entryListCache.get("rarity:mythical");
  if (legendaryCached && mythicalCached) {
    return { legendary: legendaryCached, mythical: mythicalCached };
  }

  if (!specialListsPromise) {
    specialListsPromise = buildSpecialPokemonLists(signal).catch((error) => {
      specialListsPromise = null;
      throw error;
    });
  }

  const lists = await specialListsPromise;
  entryListCache.set("rarity:legendary", lists.legendary);
  entryListCache.set("rarity:mythical", lists.mythical);
  return lists;
}

async function buildSpecialPokemonLists(signal?: AbortSignal): Promise<{
  legendary: NamedApiResource[];
  mythical: NamedApiResource[];
}> {
  const generations = await fetchJson<PokeApiNamedListResponse>(
    `${API_BASE}/generation?limit=20`,
    signal
  );

  const speciesLists = await Promise.all(
    generations.results.map((generation) =>
      fetchJson<PokeApiGenerationDetailResponse>(generation.url, signal)
    )
  );

  const allSpecies = dedupeResources(
    speciesLists.flatMap((generation) => generation.pokemon_species)
  );

  const legendary: NamedApiResource[] = [];
  const mythical: NamedApiResource[] = [];

  for (const batch of chunk(allSpecies, 25)) {
    const details = await Promise.all(
      batch.map((species) =>
        fetchJson<PokeApiSpeciesResponse>(species.url, signal)
      )
    );

    details.forEach((detail, index) => {
      const resource = speciesToPokemonResource(batch[index]);
      if (detail.is_legendary) {
        legendary.push(resource);
      }
      if (detail.is_mythical) {
        mythical.push(resource);
      }
    });
  }

  return {
    legendary: dedupeResources(legendary),
    mythical: dedupeResources(mythical),
  };
}

async function fetchPokemonByUrl(
  url: string,
  signal?: AbortSignal
): Promise<Pokemon> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) {
      throw new RequestAbortedError();
    }
    throw new Error(
      "No se pudo conectar con PokéAPI. Revisa tu conexión e inténtalo de nuevo."
    );
  }

  if (signal?.aborted) {
    throw new RequestAbortedError();
  }

  if (response.status === 404) {
    const slug = url.split("/").filter(Boolean).pop() ?? url;
    throw new PokemonNotFoundError(slug);
  }

  if (!response.ok) {
    throw new Error(`PokéAPI respondió con el estado ${response.status}.`);
  }

  const data: unknown = await response.json();
  return normalizePokemon(data);
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) {
      throw new RequestAbortedError();
    }
    throw new Error(
      "No se pudo conectar con PokéAPI. Revisa tu conexión e inténtalo de nuevo."
    );
  }

  if (signal?.aborted) {
    throw new RequestAbortedError();
  }

  if (!response.ok) {
    throw new Error(`PokéAPI respondió con el estado ${response.status}.`);
  }

  return (await response.json()) as T;
}

function normalizePokemon(data: unknown): Pokemon {
  if (data === null || typeof data !== "object") {
    throw new Error("La respuesta de PokéAPI no tiene el formato esperado.");
  }

  const record = data as PokeApiPokemonResponse;

  if (
    typeof record.id !== "number" ||
    typeof record.name !== "string" ||
    typeof record.weight !== "number"
  ) {
    throw new Error("Los datos del Pokémon no coinciden con el modelo esperado.");
  }

  const artwork =
    record.sprites.other?.["official-artwork"]?.front_default ??
    record.sprites.front_default ??
    "";

  return {
    id: record.id,
    name: record.name,
    weightKg: record.weight / 10,
    imageUrl: artwork,
  };
}

function speciesToPokemonResource(species: NamedApiResource): NamedApiResource {
  const id = extractIdFromUrl(species.url);
  if (id === null) {
    return {
      name: species.name,
      url: `${API_BASE}/pokemon/${encodeURIComponent(species.name)}`,
    };
  }

  return {
    name: species.name,
    url: `${API_BASE}/pokemon/${id}/`,
  };
}

function buildFilterCacheKey(filters: BrowseFilters): string {
  return [
    `type=${filters.type || "-"}`,
    `generation=${filters.generation || "-"}`,
    `rarity=${filters.rarity || "-"}`,
  ].join("|");
}

function intersectById(
  left: NamedApiResource[],
  right: NamedApiResource[]
): NamedApiResource[] {
  const rightIds = new Set(
    right
      .map((entry) => extractIdFromUrl(entry.url))
      .filter((id): id is number => id !== null)
  );

  return left.filter((entry) => {
    const id = extractIdFromUrl(entry.url);
    return id !== null && rightIds.has(id);
  });
}

function dedupeResources(entries: NamedApiResource[]): NamedApiResource[] {
  const seen = new Set<string>();
  const result: NamedApiResource[] = [];

  for (const entry of entries) {
    const id = extractIdFromUrl(entry.url);
    const key = id !== null ? `id:${id}` : `name:${entry.name}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(entry);
  }

  return result;
}

function dedupeById(pokemon: Pokemon[]): Pokemon[] {
  const seen = new Set<number>();
  const result: Pokemon[] = [];

  for (const entry of pokemon) {
    if (seen.has(entry.id)) {
      continue;
    }
    seen.add(entry.id);
    result.push(entry);
  }

  return result;
}

function extractIdFromUrl(url: string): number | null {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

function capitalize(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}
