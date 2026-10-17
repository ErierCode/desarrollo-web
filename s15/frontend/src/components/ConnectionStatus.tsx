import type { ConnectionStatus as Status } from "../types";

const LABELS: Record<Status, string> = {
  connected: "Conectado",
  reconnecting: "Reconectando",
  disconnected: "Desconectado",
};

interface Props {
  status: Status;
}

export function ConnectionStatus({ status }: Props) {
  return (
    <div className={`connection connection-${status}`} role="status">
      <span className="connection-dot" aria-hidden="true" />
      <span>{LABELS[status]}</span>
    </div>
  );
}
