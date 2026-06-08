export default function RelatedModelCardSkeleton() {
  return (
    <div
      className="neu-card neu-card--row neu-related-model-skeleton"
      aria-hidden="true"
    >
      <div className="neu-card-thumb">
        <div className="neu-image-groove-well neu-card-image-well neu-card-thumb-well">
          <div className="neu-card-image-slot">
            <div className="neu-card-image-frame neu-card-image-frame--fill neu-card-image-frame--shimmer">
              <div className="neu-card-image-groove" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <div className="neu-card-row-body">
        <span className="neu-card-skeleton-line neu-related-model-skeleton-name" />
        <span className="neu-card-skeleton-line neu-related-model-skeleton-meta" />
      </div>
    </div>
  );
}
