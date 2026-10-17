import { useEffect, useState } from "react";
import { createEvent, listMatches } from "../api/matches";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { EventForm } from "../components/EventForm";
import { MatchSelector } from "../components/MatchSelector";
import { Scoreboard } from "../components/Scoreboard";
import { Timeline } from "../components/Timeline";
import { useMatchLive } from "../hooks/useMatchLive";
import type { CreateEventInput, MatchSummary } from "../types";

export function AdminView() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const { match, events, connection, loading, error } = useMatchLive(selectedId);

  useEffect(() => {
    let cancelled = false;

    void listMatches()
      .then((items) => {
        if (cancelled) {
          return;
        }
        setMatches(items);
        const preferred =
          items.find((item) => item.status === "live") ?? items[0];
        if (preferred) {
          setSelectedId(preferred.id);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setListError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los partidos",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(input: CreateEventInput): Promise<void> {
    if (!selectedId) {
      throw new Error("Selecciona un partido");
    }
    await createEvent(selectedId, input);
  }

  return (
    <div className="view">
      <header className="page-header">
        <div>
          <p className="brand">LivePitch</p>
          <h1>Administración</h1>
          <p className="lede">
            Registra goles, faltas y cambios. Se guardan en la base y se emiten
            al tablero en vivo por SSE.
          </p>
        </div>
        <nav className="nav-links">
          <a href="/">En vivo</a>
          <a href="/admin" aria-current="page">
            Admin
          </a>
        </nav>
      </header>

      <div className="toolbar">
        <MatchSelector
          matches={matches}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {selectedId ? <ConnectionStatus status={connection} /> : null}
      </div>

      {listError ? <p className="banner-error">{listError}</p> : null}
      {error ? <p className="banner-error">{error}</p> : null}
      {loading ? <p className="banner-info">Cargando partido…</p> : null}

      {match ? (
        <div className="admin-layout">
          <div className="admin-main">
            <Scoreboard match={match} />
            <section className="timeline-section">
              <h2>Línea de tiempo</h2>
              <Timeline events={events} match={match} />
            </section>
          </div>
          <EventForm match={match} onSubmit={handleCreate} />
        </div>
      ) : null}
    </div>
  );
}
