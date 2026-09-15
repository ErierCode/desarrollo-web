import type { PokemonListProps } from "../types";
import { PokemonCard } from "./PokemonCard";

export function PokemonList({ pokemon }: PokemonListProps) {
  if (pokemon.length === 0) {
    return (
      <section className="dex" aria-label="Lista de Pokémon">
        <article className="pokemon-card pokemon-card--empty">
          <div className="viewport viewport--empty" aria-hidden="true" />
          <h2>Sin Pokémon aún</h2>
          <p className="weight">
            <span>Peso</span> —
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="dex" aria-label="Lista de Pokémon">
      {pokemon.map((entry) => (
        <PokemonCard key={entry.id} pokemon={entry} />
      ))}
    </section>
  );
}
