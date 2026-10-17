export const MATCH_STATUSES = ["scheduled", "live", "finished"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const EVENT_TYPES = [
  "goal",
  "foul",
  "substitution",
  "yellow_card",
  "red_card",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TEAMS = ["home", "away"] as const;
export type EventTeam = (typeof EVENT_TEAMS)[number];

export const EVENT_PERIODS = ["1H", "2H", "ET", "PEN"] as const;
export type EventPeriod = (typeof EVENT_PERIODS)[number];
