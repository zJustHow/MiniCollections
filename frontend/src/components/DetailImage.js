import React from "react";
import GroovedImage from "./GroovedImage";

export default function DetailImage({ imageUrl, alt, placeholderSize = 48 }) {
  return (
    <div className="neu-detail-image">
      <GroovedImage
        imageUrl={imageUrl}
        alt={alt}
        wellClassName="neu-detail-image-well"
        placeholderSize={placeholderSize}
      />
    </div>
  );
}
