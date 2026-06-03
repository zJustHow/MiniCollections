import React from "react";
import RelatedModelThumb from "./RelatedModelThumb";

export default function RelatedModelCard({ brandObject, onClick }) {
  const name = brandObject?.name ?? "";
  const imageUrl = brandObject?.image_url ?? brandObject?.imageUrl ?? null;
  const meta = [brandObject?.category, brandObject?.scale]
    .filter(Boolean)
    .join(" · ");

  return (
    <button type="button" className="neu-related-model-btn" onClick={onClick}>
      <RelatedModelThumb imageUrl={imageUrl} alt={name} />
      <div className="neu-related-model-btn-text">
        <div className="neu-related-model-btn-name">{name}</div>
        {meta ? (
          <div className="neu-related-model-btn-meta">{meta}</div>
        ) : null}
      </div>
    </button>
  );
}
