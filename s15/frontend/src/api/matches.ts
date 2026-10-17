import { API_BASE_URL } from "./config";
import type {
  CreateEventInput,
  MatchDetail,
  MatchEventBroadcast,
  MatchSummary,
} from "../types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Error HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        message = body.message.join(". ");
      } else if (typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function listMatches(): Promise<MatchSummary[]> {
  return request<MatchSummary[]>("/matches");
}

export function getMatch(id: string): Promise<MatchDetail> {
  return request<MatchDetail>(`/matches/${id}`);
}

export function createEvent(
  matchId: string,
  input: CreateEventInput,
): Promise<MatchEventBroadcast> {
  return request<MatchEventBroadcast>(`/matches/${matchId}/events`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function matchStreamUrl(matchId: string): string {
  return `${API_BASE_URL}/matches/${matchId}/events/stream`;
}

export function boardStreamUrl(): string {
  return `${API_BASE_URL}/matches/board/stream`;
}
