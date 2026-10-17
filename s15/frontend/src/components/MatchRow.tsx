import {
  formatKickoff,
  formatMatchClock,
  STATUS_LABEL,
} from "../eventVisuals";
import type { MatchSummary } from "../types";

interface Props {
  match: MatchSummary;
  onOpen: (id: string) => void;
}

export function MatchRow({ match, onOpen }: Props) {
  const clock = formatMatchClock(match.status, match.minute);
  const showScore = match.status !== "scheduled";

  return (
    <button
      type="button"
      className={`match-row status-${match.status}`}
      onClick={() => onOpen(match.id)}
    >
      <div className="match-row-meta">
        {match.status === "live" ? (
          <span className="live-pill">
            <span className="live-dot" aria-hidden="true" />
            {clock}
          </span>
        ) : match.status === "finished" ? (
          <span className="meta-time">{STATUS_LABEL.finished}</span>
        ) : (
          <span className="meta-time">{formatKickoff(match.kickoffAt)}</span>
        )}
      </div>

      <div className="match-row-teams">
        <span className="row-team home">{match.homeTeam}</span>
        <span className="row-score" aria-label="Marcador">
          {showScore ? (
            <>
              <strong>{match.homeScore}</strong>
              <span>—</span>
              <strong>{match.awayScore}</strong>
            </>
          ) : (
            <span className="row-vs">vs</span>
          )}
        </span>
        <span className="row-team away">{match.awayTeam}</span>
      </div>
    </button>
  );
}
