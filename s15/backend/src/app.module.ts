import { Module } from "@nestjs/common";
import { DbModule } from "./db/db.module";
import { MatchesModule } from "./matches/matches.module";

@Module({
  imports: [DbModule, MatchesModule],
})
export class AppModule {}
