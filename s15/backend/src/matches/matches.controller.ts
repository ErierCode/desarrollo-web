import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Post,
  Sse,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Observable, interval, map, merge } from "rxjs";
import { CreateEventDto } from "./dto/create-event.dto";
import { MatchesService } from "./matches.service";
import type {
  MatchDetail,
  MatchEventBroadcast,
  MatchSummary,
} from "./matches.types";

@ApiTags("matches")
@Controller("matches")
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOkResponse({ description: "Lista de partidos" })
  list(): Promise<MatchSummary[]> {
    return this.matchesService.listMatches();
  }

  @Sse("board/stream")
  boardStream(): Observable<MessageEvent> {
    const events$ = this.matchesService.getBoardStream().pipe(
      map(
        (payload): MessageEvent => ({
          id: payload.event.id,
          type: "match_event",
          data: payload,
        }),
      ),
    );

    const heartbeat$ = interval(15_000).pipe(
      map(
        (): MessageEvent => ({
          type: "heartbeat",
          data: { ok: true, at: new Date().toISOString() },
        }),
      ),
    );

    return merge(events$, heartbeat$);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Partido con historial de eventos" })
  getOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<MatchDetail> {
    return this.matchesService.getMatchDetail(id);
  }

  @Post(":id/events")
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "Evento persistido y transmitido" })
  createEvent(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateEventDto,
  ): Promise<MatchEventBroadcast> {
    return this.matchesService.createEvent(id, dto);
  }

  @Sse(":id/events/stream")
  async stream(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<Observable<MessageEvent>> {
    await this.matchesService.assertMatchExists(id);

    const events$ = this.matchesService.getEventStream(id).pipe(
      map(
        (payload): MessageEvent => ({
          id: payload.event.id,
          type: "match_event",
          data: payload,
        }),
      ),
    );

    const heartbeat$ = interval(15_000).pipe(
      map(
        (): MessageEvent => ({
          type: "heartbeat",
          data: { ok: true, at: new Date().toISOString() },
        }),
      ),
    );

    return merge(events$, heartbeat$);
  }
}
