export default function FeedbackCardSkeleton() {
  return (
    <div className="neu-feedback-card-skeleton">
      <div className="neu-feedback-card-skeleton-body">
        <div className="neu-feedback-card-skeleton-header">
          <div className="neu-feedback-card-skeleton-main">
            <span className="neu-card-skeleton-line neu-feedback-card-skeleton-tag" />
            <span className="neu-card-skeleton-line neu-feedback-card-skeleton-title" />
            <span className="neu-card-skeleton-line neu-feedback-card-skeleton-brand" />
          </div>
          <div className="neu-feedback-card-skeleton-meta">
            <span className="neu-card-skeleton-line neu-feedback-card-skeleton-tag" />
            <span className="neu-card-skeleton-line neu-feedback-card-skeleton-date" />
          </div>
        </div>
        <span className="neu-card-skeleton-line neu-feedback-card-skeleton-notes" />
      </div>
    </div>
  );
}
