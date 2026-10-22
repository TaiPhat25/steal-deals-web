"use client";

export default function StoreDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="main store-route-error" role="alert">
      <div className="container">
        <h1>Store unavailable</h1>
        <p>We could not load this store right now. Please try again.</p>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
