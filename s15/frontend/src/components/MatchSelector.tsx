import type { MatchSummary } from "../types";
import { STATUS_LABEL } from "../eventVisuals";

interface Props {
  matches: MatchSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function MatchSelector({
  matches,
  selectedId,
  onSelect,
  disabled = false,
}: Props) {
  return (
    <label className="field">
      <span className="field-label">Partido</span>
      <select
        value={selectedId ?? ""}
        disabled={disabled || matches.length === 0}
        onChange={(event) => {
          if (event.target.value) {
            onSelect(event.target.value);
          }
        }}
      >
        <option value="" disabled>
          Selecciona un partido
        </option>
        {matches.map((match) => (
          <option key={match.id} value={match.id}>
            [{STATUS_LABEL[match.status]}] {match.homeTeam} {match.homeScore}-
            {match.awayScore} {match.awayTeam}
          </option>
        ))}
      </select>
    </label>
  );
}
