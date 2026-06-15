import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { neuImageLayout } from "@minicollections/theme";

export const WELL_INSET_PX = neuImageLayout.wellInset;
export const GROOVE_PAD_PX = neuImageLayout.groovePad;
export const WELL_INSET_THUMB_PX = neuImageLayout.wellInsetThumb;
export const GROOVE_PAD_THUMB_PX = neuImageLayout.groovePadThumb;

type Size = { width: number; height: number };

/** Square logo slot — mirrors web `.neu-card-image-well--logo img { width: 68%; height: 68% }`. */
export function computeBrandLogoSlotSize(
  contentWidth: number,
  contentHeight: number,
  logoScale = neuImageLayout.logoScale,
): Size | null {
  if (contentWidth <= 0 || contentHeight <= 0) return null;
  const side = Math.floor(Math.min(contentWidth, contentHeight) * logoScale);
  if (side <= 0) return null;
  return { width: side, height: side };
}

/** Inner content area inside a padded groove frame. */
export function grooveFrameContentSize(
  frameWidth: number,
  frameHeight: number,
  groovePad: number,
): Size | null {
  const width = frameWidth - groovePad * 2;
  const height = frameHeight - groovePad * 2;
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}

type UseAdaptiveImageFrameOptions = {
  coverMode?: boolean;
  adaptiveGroove?: boolean;
  wellInset?: number;
  groovePad?: number;
  actionReserve?: number;
};

/** Mirrors web `useAdaptiveImageFrame.js` — sizes groove frame to fit image aspect ratio. */
export function useAdaptiveImageFrame(
  imageUrl: string | null | undefined,
  {
    coverMode = false,
    adaptiveGroove = true,
    wellInset = WELL_INSET_PX,
    groovePad = GROOVE_PAD_PX,
    actionReserve = 0,
  }: UseAdaptiveImageFrameOptions = {},
) {
  const [wellSize, setWellSize] = useState<Size | null>(null);
  const [frameSize, setFrameSize] = useState<Size | null>(null);
  const [imageDisplayable, setImageDisplayable] = useState(false);
  const imageSizeRef = useRef<Size | null>(null);

  const updateFrameSize = useCallback(
    (imgW: number, imgH: number) => {
      if (!wellSize || imgW <= 0 || imgH <= 0) {
        setFrameSize(null);
        return;
      }
      const maxW = wellSize.width - wellInset * 2 - groovePad * 2;
      const maxH = wellSize.height - wellInset * 2 - groovePad * 2 - actionReserve;
      if (maxW <= 0 || maxH <= 0) {
        setFrameSize(null);
        return;
      }
      if (coverMode) {
        setFrameSize({
          width: maxW + groovePad * 2,
          height: maxH + groovePad * 2,
        });
        return;
      }
      const scale = Math.min(maxW / imgW, maxH / imgH);
      setFrameSize({
        width: Math.round(imgW * scale) + groovePad * 2,
        height: Math.round(imgH * scale) + groovePad * 2,
      });
    },
    [wellSize, coverMode, wellInset, groovePad, actionReserve],
  );

  const onWellLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setWellSize({ width, height });
    }
  }, []);

  const onImageLoad = useCallback(
    (width: number, height: number) => {
      if (width > 0 && height > 0) {
        imageSizeRef.current = { width, height };
        setImageDisplayable(true);
        if (adaptiveGroove) updateFrameSize(width, height);
      } else {
        setImageDisplayable(false);
        setFrameSize(null);
      }
    },
    [adaptiveGroove, updateFrameSize],
  );

  const onImageError = useCallback(() => {
    imageSizeRef.current = null;
    setImageDisplayable(false);
    setFrameSize(null);
  }, []);

  useLayoutEffect(() => {
    if (!imageUrl) {
      imageSizeRef.current = null;
      setImageDisplayable(false);
      setFrameSize(null);
    }
  }, [imageUrl]);

  useLayoutEffect(() => {
    if (!imageUrl || !imageDisplayable || !adaptiveGroove || !imageSizeRef.current) {
      return;
    }
    updateFrameSize(imageSizeRef.current.width, imageSizeRef.current.height);
  }, [imageUrl, imageDisplayable, adaptiveGroove, updateFrameSize, wellSize]);

  return {
    onWellLayout,
    frameSize,
    imageDisplayable,
    onImageLoad,
    onImageError,
  };
}
