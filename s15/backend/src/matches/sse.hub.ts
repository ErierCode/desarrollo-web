import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";
import type { MatchEventBroadcast } from "./matches.types";

export const BOARD_CHANNEL = "__board__";

@Injectable()
export class SseHub {
  private readonly channels = new Map<string, Subject<MatchEventBroadcast>>();

  subscribe(matchId: string): Subject<MatchEventBroadcast> {
    let channel = this.channels.get(matchId);
    if (!channel) {
      channel = new Subject<MatchEventBroadcast>();
      this.channels.set(matchId, channel);
    }
    return channel;
  }

  publish(matchId: string, payload: MatchEventBroadcast): void {
    this.channels.get(matchId)?.next(payload);
    this.channels.get(BOARD_CHANNEL)?.next(payload);
  }

  subscribeBoard(): Subject<MatchEventBroadcast> {
    return this.subscribe(BOARD_CHANNEL);
  }
}
