import FeedbackCardSkeleton from "./FeedbackCardSkeleton";

export const DEFAULT_FEEDBACK_SKELETON_COUNT = 5;

export function FeedbackListSkeleton({
  count = DEFAULT_FEEDBACK_SKELETON_COUNT,
}) {
  return (
    <div className="neu-feedback-page-skeleton-list" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <FeedbackCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function FeedbackPageSkeleton({
  showToolbar = true,
  count = DEFAULT_FEEDBACK_SKELETON_COUNT,
}) {
  return (
    <div
      className="neu-feedback-page-skeleton"
      style={{ maxWidth: 720, margin: "0 auto" }}
      aria-busy="true"
    >
      {showToolbar ? (
        <div className="neu-feedback-page-skeleton-toolbar">
          <span className="neu-feedback-page-skeleton-btn">
            <span className="neu-card-skeleton-line neu-feedback-page-skeleton-btn-fill" />
          </span>
          <span className="neu-feedback-page-skeleton-btn neu-feedback-page-skeleton-btn--wide neu-feedback-page-skeleton-btn--primary">
            <span className="neu-card-skeleton-line neu-feedback-page-skeleton-btn-fill" />
          </span>
        </div>
      ) : null}
      <FeedbackListSkeleton count={count} />
    </div>
  );
}
