/** Pokémon normalizado para la aplicación (no el JSON crudo de PokéAPI). */
export interface Pokemon {
  id: number;
  name: string;
  weightKg: number;
  imageUrl: string;
}

/** Estados visibles de la solicitud / interfaz. */
export type RequestStatusKind =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

/** Mensaje asociado al estado de solicitud. */
export interface RequestStatusInfo {
  kind: RequestStatusKind;
  message: string;
}

export type RarityFilter = "" | "legendary" | "mythical" | "special";

/** Valores del formulario controlado de búsqueda. */
export interface SearchFormValues {
  query: string;
  type: string;
  generation: string;
  rarity: RarityFilter;
}

export interface FilterOption {
  name: string;
  label: string;
}

export interface SearchFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  types: FilterOption[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  typesLoading: boolean;
  generations: FilterOption[];
  selectedGeneration: string;
  onGenerationChange: (generation: string) => void;
  generationsLoading: boolean;
  selectedRarity: RarityFilter;
  onRarityChange: (rarity: RarityFilter) => void;
}

export interface RequestStatusProps {
  status: RequestStatusInfo;
}

export interface PokemonListProps {
  pokemon: Pokemon[];
}

export interface PokemonCardProps {
  pokemon: Pokemon;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}
