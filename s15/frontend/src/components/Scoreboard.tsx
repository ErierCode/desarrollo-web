import { formatMatchClock, STATUS_LABEL } from "../eventVisuals";
import type { MatchSummary } from "../types";

interface Props {
  match: MatchSummary;
}

export function Scoreboard({ match }: Props) {
  const clock = formatMatchClock(match.status, match.minute);

  return (
    <section className="scoreboard" aria-live="polite">
      <p className="scoreboard-league">{match.league}</p>
      <p className={`match-status status-${match.status}`}>
        {match.status === "live" ? (
          <>
            <span className="live-dot" aria-hidden="true" />
            EN VIVO {clock}
          </>
        ) : (
          STATUS_LABEL[match.status]
        )}
      </p>
      <div className="score-row">
        <div className="team home">
          <span className="team-name">{match.homeTeam}</span>
          <span className="team-side">Local</span>
        </div>
        <div className="score">
          <span>{match.homeScore}</span>
          <span className="score-sep">:</span>
          <span>{match.awayScore}</span>
        </div>
        <div className="team away">
          <span className="team-name">{match.awayTeam}</span>
          <span className="team-side">Visitante</span>
        </div>
      </div>
    </section>
  );
}
