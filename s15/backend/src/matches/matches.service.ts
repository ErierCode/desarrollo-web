import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import type { Database } from "../db/client";
import { DB } from "../db/db.module";
import { events, matches, type EventRow, type MatchRow } from "../db/schema";
import type { CreateEventDto } from "./dto/create-event.dto";
import type {
  MatchDetail,
  MatchEventBroadcast,
  MatchEventPayload,
  MatchSummary,
} from "./matches.types";
import { SseHub } from "./sse.hub";

@Injectable()
export class MatchesService {
  constructor(
    @Inject(DB) private readonly database: Database,
    private readonly sseHub: SseHub,
  ) {}

  async listMatches(): Promise<MatchSummary[]> {
    const rows = await this.database
      .select()
      .from(matches)
      .orderBy(asc(matches.kickoffAt));
    return rows.map(toMatchSummary);
  }

  async getMatchDetail(matchId: string): Promise<MatchDetail> {
    const match = await this.findMatchOrFail(matchId);
    const eventRows = await this.database
      .select()
      .from(events)
      .where(eq(events.matchId, matchId))
      .orderBy(asc(events.minute), asc(events.createdAt));

    return {
      ...toMatchSummary(match),
      events: eventRows.map(toEventPayload),
    };
  }

  async createEvent(
    matchId: string,
    dto: CreateEventDto,
  ): Promise<MatchEventBroadcast> {
    const match = await this.findMatchOrFail(matchId);

    const [inserted] = await this.database
      .insert(events)
      .values({
        matchId,
        type: dto.type,
        minute: dto.minute,
        team: dto.team,
        player: dto.player.trim(),
        description: (dto.description ?? "").trim(),
        period: dto.period ?? "1H",
      })
      .returning();

    const nextMinute = Math.max(match.minute, dto.minute);
    const patch: Partial<MatchRow> = {
      minute: nextMinute,
    };

    if (dto.type === "goal") {
      patch.homeScore =
        dto.team === "home" ? match.homeScore + 1 : match.homeScore;
      patch.awayScore =
        dto.team === "away" ? match.awayScore + 1 : match.awayScore;
      patch.status = match.status === "scheduled" ? "live" : match.status;
    } else if (match.status === "scheduled") {
      patch.status = "live";
    }

    const [updatedMatch] = await this.database
      .update(matches)
      .set(patch)
      .where(eq(matches.id, matchId))
      .returning();

    const broadcast: MatchEventBroadcast = {
      event: toEventPayload(inserted),
      match: toMatchSummary(updatedMatch),
    };

    // Persistió primero; luego se transmite a los espectadores del partido y al tablero.
    this.sseHub.publish(matchId, broadcast);

    return broadcast;
  }

  getEventStream(matchId: string) {
    return this.sseHub.subscribe(matchId);
  }

  getBoardStream() {
    return this.sseHub.subscribeBoard();
  }

  async assertMatchExists(matchId: string): Promise<void> {
    await this.findMatchOrFail(matchId);
  }

  private async findMatchOrFail(matchId: string): Promise<MatchRow> {
    const [match] = await this.database
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!match) {
      throw new NotFoundException(`No existe el partido ${matchId}`);
    }

    return match;
  }
}

function toMatchSummary(row: MatchRow): MatchSummary {
  return {
    id: row.id,
    homeTeam: row.homeTeam,
    awayTeam: row.awayTeam,
    league: row.league,
    status: row.status,
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    minute: row.minute,
    kickoffAt: row.kickoffAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function toEventPayload(row: EventRow): MatchEventPayload {
  return {
    id: row.id,
    matchId: row.matchId,
    type: row.type,
    minute: row.minute,
    team: row.team,
    player: row.player,
    description: row.description,
    period: row.period,
    createdAt: row.createdAt.toISOString(),
  };
}
