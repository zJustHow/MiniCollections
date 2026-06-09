import RelatedModelCardSkeleton from "./RelatedModelCardSkeleton";

export default function ObjectDetailPageSkeleton({
  showRelatedModel = false,
}) {
  return (
    <div className="neu-object-detail-skeleton" aria-busy="true">
      <div className="neu-object-detail-layout">
        <div className="neu-object-detail-image-col">
          <div className="neu-panel">
            <div className="neu-image-groove-well neu-detail-image-well">
              <div className="neu-card-image-slot">
                <div className="neu-card-image-frame neu-card-image-frame--fill neu-card-image-frame--shimmer">
                  <div className="neu-card-image-groove" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="neu-object-detail-info-col">
          <div className="neu-panel neu-object-detail-skeleton-panel">
            <span className="neu-card-skeleton-line neu-object-detail-skeleton-row" />
            <span className="neu-card-skeleton-line neu-object-detail-skeleton-row" />
            <span className="neu-card-skeleton-line neu-object-detail-skeleton-notes" />
          </div>
          {showRelatedModel ? (
            <div className="neu-detail-follow-on">
              <span className="neu-card-skeleton-line neu-object-detail-skeleton-label" />
              <RelatedModelCardSkeleton />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
