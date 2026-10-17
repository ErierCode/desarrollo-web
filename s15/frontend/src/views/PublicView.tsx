import { useMemo, useState } from "react";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { MatchRow } from "../components/MatchRow";
import { Scoreboard } from "../components/Scoreboard";
import { Timeline } from "../components/Timeline";
import { useMatchLive } from "../hooks/useMatchLive";
import { useMatchesBoard } from "../hooks/useMatchesBoard";
import type { BoardFilter, MatchSummary } from "../types";

function readMatchParam(): string | null {
  const value = new URLSearchParams(window.location.search).get("match");
  return value && value.length > 0 ? value : null;
}

function writeMatchParam(id: string | null): void {
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set("match", id);
  } else {
    url.searchParams.delete("match");
  }
  window.history.replaceState({}, "", url);
}

export function PublicView() {
  const { matches, connection, loading, error } = useMatchesBoard();
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    readMatchParam(),
  );
  const live = useMatchLive(selectedId);

  function openMatch(id: string): void {
    setSelectedId(id);
    writeMatchParam(id);
  }

  function closeMatch(): void {
    setSelectedId(null);
    writeMatchParam(null);
  }

  const liveCount = matches.filter((m) => m.status === "live").length;

  const filtered = useMemo(() => {
    if (filter === "all") {
      return matches;
    }
    return matches.filter((m) => m.status === filter);
  }, [filter, matches]);

  const byLeague = useMemo(() => groupByLeague(filtered), [filtered]);

  if (selectedId) {
    return (
      <div className="view">
        <header className="page-header compact">
          <div>
            <p className="brand">LivePitch</p>
            <button type="button" className="back-link" onClick={closeMatch}>
              ← Volver al tablero
            </button>
          </div>
          <nav className="nav-links">
            <a href="/" aria-current="page">
              En vivo
            </a>
            <a href="/admin">Admin</a>
          </nav>
        </header>

        <div className="toolbar detail-toolbar">
          <ConnectionStatus status={live.connection} />
        </div>

        {live.error ? <p className="banner-error">{live.error}</p> : null}
        {live.loading ? <p className="banner-info">Cargando partido…</p> : null}

        {live.match ? (
          <>
            <Scoreboard match={live.match} />
            <section className="timeline-section">
              <h2>Línea de tiempo</h2>
              <Timeline events={live.events} match={live.match} />
            </section>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="view board-view">
      <header className="page-header">
        <div>
          <p className="brand">LivePitch</p>
          <h1>Fútbol en vivo</h1>
          <p className="lede">
            Resultados y eventos en tiempo real. Tocá un partido para ver la
            línea de tiempo.
          </p>
        </div>
        <nav className="nav-links">
          <a href="/" aria-current="page">
            En vivo
          </a>
          <a href="/admin">Admin</a>
        </nav>
      </header>

      <div className="board-toolbar">
        <div className="filter-bar" role="tablist" aria-label="Filtro de partidos">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Todos"
          />
          <FilterButton
            active={filter === "live"}
            onClick={() => setFilter("live")}
            label={`${liveCount} En vivo`}
            live
          />
          <FilterButton
            active={filter === "scheduled"}
            onClick={() => setFilter("scheduled")}
            label="Próximos"
          />
          <FilterButton
            active={filter === "finished"}
            onClick={() => setFilter("finished")}
            label="Finalizados"
          />
        </div>
        <ConnectionStatus status={connection} />
      </div>

      {error ? <p className="banner-error">{error}</p> : null}
      {loading ? <p className="banner-info">Cargando partidos…</p> : null}

      {!loading && filtered.length === 0 ? (
        <p className="banner-info">No hay partidos en este filtro.</p>
      ) : null}

      {byLeague.map(([league, items]) => (
        <section key={league} className="league-block">
          <header className="league-header">
            <h2>{league}</h2>
            <span className="league-count">{items.length}</span>
          </header>
          <div className="match-list">
            {items.map((match) => (
              <MatchRow key={match.id} match={match} onOpen={openMatch} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  live = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  live?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`filter-btn ${active ? "active" : ""} ${live ? "has-live" : ""}`}
      onClick={onClick}
    >
      {live ? <span className="live-dot" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}

function groupByLeague(items: MatchSummary[]): [string, MatchSummary[]][] {
  const map = new Map<string, MatchSummary[]>();
  for (const match of items) {
    const bucket = map.get(match.league) ?? [];
    bucket.push(match);
    map.set(match.league, bucket);
  }
  return [...map.entries()];
}
