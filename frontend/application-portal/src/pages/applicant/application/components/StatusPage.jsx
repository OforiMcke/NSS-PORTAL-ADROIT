export function StatusPage({ embedded, children, isError }) {
  return (
    <div className={`af-page ${embedded ? "af-embedded" : ""}`}>
      <div className="af-card">
        <p className={isError ? "af-status-error" : "af-status"}>{children}</p>
      </div>
    </div>
  );
}
