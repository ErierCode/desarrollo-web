import { EVENT_VISUALS } from "../eventVisuals";
import type { MatchEvent, MatchSummary } from "../types";

interface Props {
  events: MatchEvent[];
  match: MatchSummary;
}

export function Timeline({ events, match }: Props) {
  if (events.length === 0) {
    return (
      <p className="empty-timeline">
        Aún no hay eventos en este partido. El historial aparecerá aquí en vivo.
      </p>
    );
  }

  return (
    <ol className="timeline">
      {events.map((event) => {
        const visual = EVENT_VISUALS[event.type];
        const teamName =
          event.team === "home" ? match.homeTeam : match.awayTeam;

        return (
          <li key={event.id} className={`timeline-item ${visual.className}`}>
            <div className="event-mark" aria-hidden="true">
              {visual.mark}
            </div>
            <div className="event-body">
              <div className="event-meta">
                <span className="event-minute">{event.minute}&apos;</span>
                <span className="event-period">{event.period}</span>
                <span className="event-type">{visual.label}</span>
              </div>
              <p className="event-player">{event.player}</p>
              <p className="event-team">{teamName}</p>
              {event.description ? (
                <p className="event-desc">{event.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
