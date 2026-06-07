import React from "react";
import { PictureOutlined } from "@ant-design/icons";
import {
  useAdaptiveImageFrame,
  IMAGE_ACTION_RESERVE_PX,
} from "./useAdaptiveImageFrame";
import { resolveMediaUrl } from "../utils";

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
  frameAction,
}) {
  const src = resolveMediaUrl(imageUrl);
  const { wellRef, frameSize, imageDisplayable, onImageLoad, onImageError } =
    useAdaptiveImageFrame(src, {
      coverMode,
      adaptiveGroove: !fixedGroove,
      wellInset,
      groovePad,
      actionReserve: frameAction ? IMAGE_ACTION_RESERVE_PX : 0,
    });

  const placeholderStyle =
    placeholderSize != null
      ? { "--neu-placeholder-icon-size": `${placeholderSize}px` }
      : undefined;

  const iconStyle = { color: "var(--neu-text-2)" };

  const placeholder = (
    <div className="neu-card-image-frame neu-card-image-frame--fill">
      <div className="neu-card-image-placeholder" style={placeholderStyle}>
        <PlaceholderIcon style={iconStyle} />
      </div>
      <div className="neu-card-image-groove" aria-hidden="true" />
    </div>
  );

  const renderFrame = () => {
    if (!src) return placeholder;
    if (fixedGroove) {
      return (
        <div className="neu-card-image-frame neu-card-image-frame--fill">
          <img
            className="neu-card-image-display"
            src={src}
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
          src={src}
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

  const showFrameAction =
    Boolean(frameAction) && (fixedGroove || imageDisplayable);
  const frameActionNode = showFrameAction ? (
    <div className="neu-image-upload-remove neu-image-upload-remove--on-groove">
      {frameAction}
    </div>
  ) : null;

  const renderFrameWithAction = (frameNode) => {
    if (!frameActionNode) return frameNode;
    return (
      <div
        className={`neu-card-image-stack${fixedGroove ? " neu-card-image-stack--fill" : ""}`}
      >
        {frameNode}
        {frameActionNode}
      </div>
    );
  };

  return (
    <div ref={wellRef} className={wellClasses}>
      <div className="neu-card-image-slot">
        {src && !fixedGroove && !imageDisplayable && (
          <img
            className="neu-card-image-preload"
            src={src}
            alt=""
            aria-hidden
            loading={loading}
            onLoad={onImageLoad}
            onError={onImageError}
          />
        )}
        {renderFrameWithAction(renderFrame())}
      </div>
    </div>
  );
}
