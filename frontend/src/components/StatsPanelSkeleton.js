export default function StatsPanelSkeleton({ variant = "column", wide = false }) {
  return (
    <section
      className={`stats-card stats-panel-skeleton${wide ? " stats-card--wide" : ""}`}
      aria-busy="true"
      aria-hidden="true"
    >
      <span className="neu-card-skeleton-line stats-panel-skeleton-title" />
      <div className="stats-chart-wrap stats-panel-skeleton-chart">
        {variant === "pie" ? (
          <div className="stats-panel-skeleton-pie-wrap">
            <span className="stats-panel-skeleton-pie neu-skeleton-shimmer" />
          </div>
        ) : null}
        {variant === "column" ? (
          <div className="stats-panel-skeleton-columns">
            {[52, 78, 44, 92, 64, 70, 48, 86].map((height, index) => (
              <span
                key={index}
                className="stats-panel-skeleton-column-bar neu-skeleton-shimmer"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        ) : null}
        {variant === "line" ? (
          <div className="stats-panel-skeleton-line-chart neu-skeleton-shimmer" />
        ) : null}
      </div>
    </section>
  );
}
