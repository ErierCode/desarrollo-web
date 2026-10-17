import { Module } from "@nestjs/common";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";
import { SseHub } from "./sse.hub";

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, SseHub],
})
export class MatchesModule {}
