import type { PokemonCardProps } from "../types";

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const weightLabel = `${pokemon.weightKg.toFixed(1)} kg`;

  return (
    <article className="pokemon-card" data-id={pokemon.id}>
      <div className="viewport">
        {pokemon.imageUrl ? (
          <img
            src={pokemon.imageUrl}
            alt={`Arte oficial de ${pokemon.name}`}
            width={132}
            height={132}
            loading="lazy"
          />
        ) : (
          <div className="viewport-fallback" aria-hidden="true" />
        )}
      </div>
      <h2>{pokemon.name}</h2>
      <p className="weight">
        <span>Peso</span> {weightLabel}
      </p>
      <p className="meta">#{String(pokemon.id).padStart(3, "0")}</p>
    </article>
  );
}
