interface FeedbackProps {
  kind: "loading" | "success" | "error";
  heading: string;
  messages?: string[];
}

export function Feedback({ kind, heading, messages = [] }: FeedbackProps) {
  return (
    <div className="feedback" role="status" aria-live="polite" data-kind={kind}>
      <p>{heading}</p>
      {messages.length > 0 ? (
        <ul>
          {messages.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
