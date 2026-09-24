type HomeCollectionStateProps = {
  message: string;
  onRetry?: () => void;
  state: "loading" | "empty" | "error";
  title?: string;
};

export default function HomeCollectionState({
  message,
  onRetry,
  state,
  title,
}: HomeCollectionStateProps) {
  if (state === "loading") {
    return (
      <div
        className="home-collection-skeleton"
        role="status"
        aria-label={message}
        aria-live="polite"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className="home-collection-skeleton__item"
            aria-hidden="true"
          >
            <span className="home-collection-skeleton__image" />
            <span className="home-collection-skeleton__line home-collection-skeleton__line--short" />
            <span className="home-collection-skeleton__line" />
            <span className="home-collection-skeleton__line home-collection-skeleton__line--medium" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`home-collection-state home-collection-state--${state}`}
      role={state === "error" ? "alert" : "status"}
    >
      {title ? <h3>{title}</h3> : null}
      <p>{message}</p>
      {state === "error" && onRetry ? (
        <button
          type="button"
          className="btn btn-outline-primary-2 home-collection-state__retry"
          onClick={onRetry}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
