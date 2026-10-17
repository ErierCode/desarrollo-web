import { useEffect, useState } from "react";
import { boardStreamUrl, listMatches } from "../api/matches";
import type {
  ConnectionStatus,
  MatchEventBroadcast,
  MatchSummary,
} from "../types";

interface UseMatchesBoardResult {
  matches: MatchSummary[];
  connection: ConnectionStatus;
  loading: boolean;
  error: string | null;
}

export function useMatchesBoard(): UseMatchesBoardResult {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [connection, setConnection] =
    useState<ConnectionStatus>("disconnected");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    async function loadAndConnect(): Promise<void> {
      try {
        const items = await listMatches();
        if (cancelled) {
          return;
        }
        setMatches(items);
        setLoading(false);
        openStream();
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setConnection("disconnected");
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los partidos",
          );
        }
      }
    }

    function openStream(): void {
      if (cancelled) {
        return;
      }

      setConnection("reconnecting");
      source = new EventSource(boardStreamUrl());

      source.addEventListener("match_event", (message) => {
        if (cancelled) {
          return;
        }

        try {
          const payload = JSON.parse(
            (message as MessageEvent<string>).data,
          ) as MatchEventBroadcast;

          setMatches((prev) => {
            const index = prev.findIndex((m) => m.id === payload.match.id);
            if (index === -1) {
              return [...prev, payload.match];
            }
            const next = [...prev];
            next[index] = payload.match;
            return next;
          });
        } catch {
          // ignore
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
  }, []);

  return { matches, connection, loading, error };
}
