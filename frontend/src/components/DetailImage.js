import React from "react";
import GroovedImage from "./GroovedImage";

export default function DetailImage({ imageUrl, alt, placeholderSize = 48, onClick }) {
  return (
    <div
      className="neu-panel"
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <GroovedImage
        imageUrl={imageUrl}
        alt={alt}
        wellClassName="neu-detail-image-well"
        placeholderSize={placeholderSize}
        loading="eager"
      />
    </div>
  );
}
