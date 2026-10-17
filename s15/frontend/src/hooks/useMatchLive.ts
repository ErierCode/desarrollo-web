import { useEffect, useRef, useState } from "react";
import { getMatch, matchStreamUrl } from "../api/matches";
import type {
  ConnectionStatus,
  MatchDetail,
  MatchEvent,
  MatchEventBroadcast,
  MatchSummary,
} from "../types";

interface UseMatchLiveResult {
  match: MatchSummary | null;
  events: MatchEvent[];
  connection: ConnectionStatus;
  loading: boolean;
  error: string | null;
}

function sortEvents(events: MatchEvent[]): MatchEvent[] {
  return [...events].sort((a, b) => {
    if (a.minute !== b.minute) {
      return a.minute - b.minute;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function useMatchLive(matchId: string | null): UseMatchLiveResult {
  const [match, setMatch] = useState<MatchSummary | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [connection, setConnection] =
    useState<ConnectionStatus>("disconnected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    if (!matchId) {
      setMatch(null);
      setEvents([]);
      setConnection("disconnected");
      setLoading(false);
      setError(null);
      seenIds.current = new Set();
      return;
    }

    let cancelled = false;
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    seenIds.current = new Set();
    setLoading(true);
    setError(null);
    setConnection("disconnected");

    async function loadAndConnect(): Promise<void> {
      try {
        const detail: MatchDetail = await getMatch(matchId!);
        if (cancelled) {
          return;
        }

        for (const event of detail.events) {
          seenIds.current.add(event.id);
        }

        setMatch(summaryFromDetail(detail));
        setEvents(sortEvents(detail.events));
        setLoading(false);
        openStream();
      } catch (err) {
        if (cancelled) {
          return;
        }
        setLoading(false);
        setConnection("disconnected");
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el partido",
        );
      }
    }

    function openStream(): void {
      if (cancelled || !matchId) {
        return;
      }

      setConnection("reconnecting");
      source = new EventSource(matchStreamUrl(matchId));

      source.addEventListener("match_event", (message) => {
        if (cancelled) {
          return;
        }

        try {
          const payload = JSON.parse(
            (message as MessageEvent<string>).data,
          ) as MatchEventBroadcast;

          if (payload.event.matchId !== matchId) {
            return;
          }

          if (seenIds.current.has(payload.event.id)) {
            return;
          }

          seenIds.current.add(payload.event.id);
          setMatch(payload.match);
          setEvents((prev) => sortEvents([...prev, payload.event]));
        } catch {
          // ignore malformed payloads
        }
      });

      source.onopen = () => {
        if (!cancelled) {
          setConnection("connected");
        }
      };

      source.onerror = () => {
        if (cancelled) {
          return;
        }
        setConnection("reconnecting");
        source?.close();
        source = null;
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }
        reconnectTimer = setTimeout(() => {
          if (!cancelled) {
            openStream();
          }
        }, 2000);
      };
    }

    void loadAndConnect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      source?.close();
      setConnection("disconnected");
    };
  }, [matchId]);

  return { match, events, connection, loading, error };
}

function summaryFromDetail(detail: MatchDetail): MatchSummary {
  return {
    id: detail.id,
    homeTeam: detail.homeTeam,
    awayTeam: detail.awayTeam,
    league: detail.league,
    status: detail.status,
    homeScore: detail.homeScore,
    awayScore: detail.awayScore,
    minute: detail.minute,
    kickoffAt: detail.kickoffAt,
    createdAt: detail.createdAt,
  };
}
