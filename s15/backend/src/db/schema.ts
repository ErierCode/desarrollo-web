import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "goal",
  "foul",
  "substitution",
  "yellow_card",
  "red_card",
]);

export const eventPeriodEnum = pgEnum("event_period", [
  "1H",
  "2H",
  "ET",
  "PEN",
]);

export const eventTeamEnum = pgEnum("event_team", ["home", "away"]);

export const matches = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  league: text("league").notNull().default("Liga"),
  status: matchStatusEnum("status").notNull().default("scheduled"),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  minute: integer("minute").notNull().default(0),
  kickoffAt: timestamp("kickoff_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  type: eventTypeEnum("type").notNull(),
  minute: integer("minute").notNull(),
  team: eventTeamEnum("team").notNull(),
  player: text("player").notNull(),
  description: text("description").notNull().default(""),
  period: eventPeriodEnum("period").notNull().default("1H"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type MatchRow = typeof matches.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type NewEvent = typeof events.$inferInsert;
