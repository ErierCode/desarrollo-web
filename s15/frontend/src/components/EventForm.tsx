import { useState, type FormEvent } from "react";
import type {
  CreateEventInput,
  EventPeriod,
  EventTeam,
  EventType,
  MatchSummary,
} from "../types";

interface Props {
  match: MatchSummary;
  onSubmit: (input: CreateEventInput) => Promise<void>;
}

const TYPES: { value: EventType; label: string }[] = [
  { value: "goal", label: "Gol" },
  { value: "foul", label: "Falta" },
  { value: "substitution", label: "Cambio" },
  { value: "yellow_card", label: "Tarjeta amarilla" },
  { value: "red_card", label: "Tarjeta roja" },
];

const PERIODS: EventPeriod[] = ["1H", "2H", "ET", "PEN"];

export function EventForm({ match, onSubmit }: Props) {
  const [type, setType] = useState<EventType>("goal");
  const [minute, setMinute] = useState("45");
  const [team, setTeam] = useState<EventTeam>("home");
  const [player, setPlayer] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState<EventPeriod>("1H");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);

    const minuteNumber = Number(minute);
    if (!Number.isInteger(minuteNumber) || minuteNumber < 0 || minuteNumber > 120) {
      setFormError("El minuto debe ser un entero entre 0 y 120.");
      return;
    }

    const trimmedPlayer = player.trim();
    if (trimmedPlayer.length < 2) {
      setFormError("Indica el jugador (mínimo 2 caracteres).");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        minute: minuteNumber,
        team,
        player: trimmedPlayer,
        description: description.trim() || undefined,
        period,
      });
      setSuccess("Evento registrado y transmitido.");
      setPlayer("");
      setDescription("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "No se pudo registrar el evento",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit} noValidate>
      <h2>Registrar evento</h2>
      <p className="form-hint">
        {match.homeTeam} vs {match.awayTeam}
      </p>

      <label className="field">
        <span className="field-label">Tipo</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
        >
          {TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field-label">Minuto</span>
          <input
            type="number"
            min={0}
            max={120}
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Periodo</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as EventPeriod)}
          >
            {PERIODS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field-label">Equipo</span>
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value as EventTeam)}
        >
          <option value="home">{match.homeTeam} (local)</option>
          <option value="away">{match.awayTeam} (visitante)</option>
        </select>
      </label>

      <label className="field">
        <span className="field-label">Jugador</span>
        <input
          type="text"
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          maxLength={80}
          placeholder="Nombre del jugador"
          required
        />
      </label>

      <label className="field">
        <span className="field-label">Descripción</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={240}
          rows={3}
          placeholder="Opcional"
        />
      </label>

      {formError ? <p className="form-error">{formError}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Guardando…" : "Enviar evento"}
      </button>
    </form>
  );
}
