export default function Loading() {
  return (
    <main className="main store-route-loading" aria-busy="true">
      <div className="store-route-loading__spinner" aria-hidden="true" />
      <p role="status">Loading page...</p>
    </main>
  );
}
