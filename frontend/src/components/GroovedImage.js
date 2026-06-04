import React from "react";
import { PictureOutlined } from "@ant-design/icons";
import { useAdaptiveImageFrame } from "./useAdaptiveImageFrame";

export default function GroovedImage({
  imageUrl,
  alt = "",
  wellClassName = "neu-card-image-well",
  coverMode = false,
  fixedGroove = false,
  wellInset,
  groovePad,
  placeholderIcon: PlaceholderIcon = PictureOutlined,
  placeholderSize,
  loading = "lazy",
}) {
  const { wellRef, frameSize, imageDisplayable, onImageLoad, onImageError } =
    useAdaptiveImageFrame(imageUrl, {
      coverMode,
      adaptiveGroove: !fixedGroove,
      wellInset,
      groovePad,
    });

  const placeholderStyle =
    placeholderSize != null
      ? { fontSize: placeholderSize, color: "var(--neu-text-2)" }
      : { color: "var(--neu-text-2)" };

  const placeholder = (
    <div className="neu-card-image-frame neu-card-image-frame--fill">
      <div className="neu-card-image-placeholder">
        <PlaceholderIcon style={placeholderStyle} />
      </div>
      <div className="neu-card-image-groove" aria-hidden="true" />
    </div>
  );

  const renderFrame = () => {
    if (!imageUrl) return placeholder;
    if (fixedGroove) {
      return (
        <div className="neu-card-image-frame neu-card-image-frame--fill">
          <img
            className="neu-card-image-display"
            src={imageUrl}
            alt={alt}
            loading="eager"
            onLoad={onImageLoad}
            onError={onImageError}
          />
          <div className="neu-card-image-groove" aria-hidden="true" />
        </div>
      );
    }
    if (!imageDisplayable) return placeholder;
    return (
      <div
        className="neu-card-image-frame"
        style={
          frameSize
            ? { width: frameSize.width, height: frameSize.height }
            : undefined
        }
      >
        <img
          className="neu-card-image-display"
          src={imageUrl}
          alt={alt}
          loading="eager"
        />
        <div className="neu-card-image-groove" aria-hidden="true" />
      </div>
    );
  };

  const wellClasses = [
    "neu-image-groove-well",
    wellClassName,
    coverMode && wellClassName === "neu-card-image-well"
      ? "neu-card-image-well--cover"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={wellRef} className={wellClasses}>
      <div className="neu-card-image-slot">
        {imageUrl && !fixedGroove && !imageDisplayable && (
          <img
            className="neu-card-image-preload"
            src={imageUrl}
            alt=""
            aria-hidden
            loading={loading}
            onLoad={onImageLoad}
            onError={onImageError}
          />
        )}
        {renderFrame()}
      </div>
    </div>
  );
}
