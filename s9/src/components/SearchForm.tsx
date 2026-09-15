import type { FormEvent } from "react";
import type { RarityFilter, SearchFormProps } from "../types";

export function SearchForm({
  value,
  onChange,
  onSubmit,
  isLoading,
  types,
  selectedType,
  onTypeChange,
  typesLoading,
  generations,
  selectedGeneration,
  onGenerationChange,
  generationsLoading,
  selectedRarity,
  onRarityChange,
}: SearchFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate>
      <div className="search-row">
        <label className="search" htmlFor="pokemon-query">
          Buscar Pokémon
          <input
            id="pokemon-query"
            name="pokemon"
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ejemplo: ditto o 25"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="search-help"
          />
        </label>

        <label className="search" htmlFor="pokemon-type">
          Tipo
          <select
            id="pokemon-type"
            name="type"
            value={selectedType}
            onChange={(event) => onTypeChange(event.target.value)}
            disabled={typesLoading || isLoading}
            aria-describedby="search-help"
          >
            <option value="">
              {typesLoading ? "Cargando tipos…" : "Cualquiera"}
            </option>
            {types.map((type) => (
              <option key={type.name} value={type.name}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="search-row">
        <label className="search" htmlFor="pokemon-generation">
          Generación
          <select
            id="pokemon-generation"
            name="generation"
            value={selectedGeneration}
            onChange={(event) => onGenerationChange(event.target.value)}
            disabled={generationsLoading || isLoading}
            aria-describedby="search-help"
          >
            <option value="">
              {generationsLoading ? "Cargando generaciones…" : "Cualquiera"}
            </option>
            {generations.map((generation) => (
              <option key={generation.name} value={generation.name}>
                {generation.label}
              </option>
            ))}
          </select>
        </label>

        <label className="search" htmlFor="pokemon-rarity">
          Rareza
          <select
            id="pokemon-rarity"
            name="rarity"
            value={selectedRarity}
            onChange={(event) =>
              onRarityChange(event.target.value as RarityFilter)
            }
            disabled={isLoading}
            aria-describedby="search-help"
          >
            <option value="">Cualquiera</option>
            <option value="legendary">Solo legendarios</option>
            <option value="mythical">Solo míticos</option>
            <option value="special">Legendarios y míticos</option>
          </select>
        </label>
      </div>

      <p id="search-help" className="hint">
        Combina tipo, generación y rareza (50 por página), o busca por
        nombre/número para añadir a tu colección.
      </p>

      <button type="submit" disabled={isLoading || value.trim().length === 0}>
        {isLoading ? "Buscando…" : "Añadir a la Pokédex"}
      </button>
    </form>
  );
}
