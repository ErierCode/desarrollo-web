import type { RequestStatusProps } from "../types";

export function RequestStatus({ status }: RequestStatusProps) {
  return (
    <p
      className="status"
      role="status"
      aria-live="polite"
      data-state={status.kind}
    >
      {status.message}
    </p>
  );
}
