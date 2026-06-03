import React from "react";
import GroovedImage from "./GroovedImage";

const THUMB_WELL_INSET = 3;
const THUMB_GROOVE_PAD = 2;

export default function RelatedModelThumb({ imageUrl, alt }) {
  return (
    <div className="neu-related-model-thumb">
      <GroovedImage
        imageUrl={imageUrl}
        alt={alt}
        wellClassName="neu-related-model-thumb-well"
        wellInset={THUMB_WELL_INSET}
        groovePad={THUMB_GROOVE_PAD}
      />
    </div>
  );
}
