import type { EventType, MatchStatus } from "./types";

export interface EventVisual {
  label: string;
  mark: string;
  className: string;
}

export const EVENT_VISUALS: Record<EventType, EventVisual> = {
  goal: { label: "Gol", mark: "GOL", className: "event-goal" },
  foul: { label: "Falta", mark: "FLT", className: "event-foul" },
  substitution: { label: "Cambio", mark: "SUB", className: "event-sub" },
  yellow_card: { label: "Amarilla", mark: "YC", className: "event-yellow" },
  red_card: { label: "Roja", mark: "RC", className: "event-red" },
};

export const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "Próximo",
  live: "En vivo",
  finished: "Final",
};

export function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMatchClock(status: MatchStatus, minute: number): string {
  if (status === "live") {
    return `${minute}'`;
  }
  if (status === "finished") {
    return "FT";
  }
  return "";
}
