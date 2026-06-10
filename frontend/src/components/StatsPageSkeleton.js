import StatsPanelSkeleton from "./StatsPanelSkeleton";
import "../styles/stats-page.css";

export default function StatsPageSkeleton() {
  return (
    <div className="stats-page stats-page-skeleton" aria-busy="true">
      <div className="stats-page-inner">
        <span className="neu-card-skeleton-line stats-skeleton-page-title" />
        <span className="neu-card-skeleton-line stats-skeleton-page-summary" />
        <div className="stats-grid">
          <StatsPanelSkeleton variant="pie" />
          <StatsPanelSkeleton variant="column" />
          <StatsPanelSkeleton variant="line" wide />
        </div>
      </div>
    </div>
  );
}
