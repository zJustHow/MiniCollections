export default function NeuCardSkeleton({ variant = "catalog" }) {
  const isObject = variant === "object";

  return (
    <div
      className="neu-card-skeleton ant-card neu-card"
      aria-hidden="true"
    >
      <div className="ant-card-cover">
        <div className="neu-card-cover">
          <div className="neu-image-groove-well neu-card-image-well">
            <div className="neu-card-image-slot">
              <div className="neu-card-image-frame neu-card-image-frame--fill neu-card-image-frame--shimmer">
                <div className="neu-card-image-groove" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div
            className={`neu-nameplate ${
              isObject ? "neu-nameplate--object" : "neu-nameplate--catalog"
            }`}
          >
            {isObject ? (
              <div className="neu-nameplate-subtitle">
                <span className="neu-card-skeleton-line neu-card-skeleton-line--subtitle" />
              </div>
            ) : null}
            <div className="neu-nameplate-title">
              <span className="neu-card-skeleton-line neu-card-skeleton-line--title" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
