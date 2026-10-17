export type MatchStatus = "scheduled" | "live" | "finished";
export type EventType =
  | "goal"
  | "foul"
  | "substitution"
  | "yellow_card"
  | "red_card";
export type EventTeam = "home" | "away";
export type EventPeriod = "1H" | "2H" | "ET" | "PEN";
export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";
export type BoardFilter = "all" | "live" | "scheduled" | "finished";

export interface MatchSummary {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  minute: number;
  kickoffAt: string;
  createdAt: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: EventType;
  minute: number;
  team: EventTeam;
  player: string;
  description: string;
  period: EventPeriod;
  createdAt: string;
}

export interface MatchDetail extends MatchSummary {
  events: MatchEvent[];
}

export interface MatchEventBroadcast {
  event: MatchEvent;
  match: MatchSummary;
}

export interface CreateEventInput {
  type: EventType;
  minute: number;
  team: EventTeam;
  player: string;
  description?: string;
  period?: EventPeriod;
}
