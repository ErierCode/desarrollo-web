import type {
  EventPeriod,
  EventTeam,
  EventType,
  MatchStatus,
} from "./match.enums";

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

export interface MatchEventPayload {
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
  events: MatchEventPayload[];
}

export interface MatchEventBroadcast {
  event: MatchEventPayload;
  match: MatchSummary;
}
