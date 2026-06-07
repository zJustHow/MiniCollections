import { useCallback, useLayoutEffect, useRef, useState } from "react";

export const WELL_INSET_PX = 6;
export const GROOVE_PAD_PX = 4;
/** gap + remove btn + shadow buffer — keep in sync with skeuomorphic.css upload action reserve */
export const IMAGE_ACTION_RESERVE_PX = 42;

function probeCachedImage(url) {
  if (!url) return null;
  const probe = new Image();
  probe.src = url;
  if (probe.complete && probe.naturalWidth > 0) return probe;
  return null;
}

export function useAdaptiveImageFrame(
  imageUrl,
  {
    coverMode = false,
    adaptiveGroove = true,
    wellInset = WELL_INSET_PX,
    groovePad = GROOVE_PAD_PX,
    actionReserve = 0,
  } = {},
) {
  const wellRef = useRef(null);
  const [frameSize, setFrameSize] = useState(null);
  const [imageDisplayable, setImageDisplayable] = useState(() =>
    Boolean(probeCachedImage(imageUrl)),
  );

  const updateFrameSize = useCallback(
    (img) => {
      const well = wellRef.current;
      if (!well || !img?.naturalWidth) {
        setFrameSize(null);
        return;
      }
      const maxW = well.clientWidth - wellInset * 2 - groovePad * 2;
      const maxH =
        well.clientHeight - wellInset * 2 - groovePad * 2 - actionReserve;
      if (coverMode) {
        setFrameSize({
          width: maxW + groovePad * 2,
          height: maxH + groovePad * 2,
        });
        return;
      }
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      setFrameSize({
        width: Math.round(img.naturalWidth * scale) + groovePad * 2,
        height: Math.round(img.naturalHeight * scale) + groovePad * 2,
      });
    },
    [coverMode, wellInset, groovePad, actionReserve],
  );

  const onImageLoad = useCallback(
    (e) => {
      const img = e.currentTarget;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setImageDisplayable(true);
        if (adaptiveGroove) updateFrameSize(img);
      } else {
        setImageDisplayable(false);
        setFrameSize(null);
      }
    },
    [adaptiveGroove, updateFrameSize],
  );

  const onImageError = useCallback(() => {
    setImageDisplayable(false);
    setFrameSize(null);
  }, []);

  // Re-sync in layout before paint. Cached images skip the placeholder; uncached
  // images fall back to the hidden preload element in the same frame.
  useLayoutEffect(() => {
    if (!imageUrl) {
      setImageDisplayable(false);
      setFrameSize(null);
      return undefined;
    }

    const cached = probeCachedImage(imageUrl);
    if (cached) {
      setImageDisplayable(true);
      if (adaptiveGroove) updateFrameSize(cached);
      return undefined;
    }

    setImageDisplayable(false);
    setFrameSize(null);

    let cancelled = false;
    const syncFromPreload = () => {
      if (cancelled) return;
      const preload = wellRef.current?.querySelector(
        "img.neu-card-image-preload",
      );
      if (preload?.complete && preload.naturalWidth > 0) {
        onImageLoad({ currentTarget: preload });
      }
    };

    syncFromPreload();
    return () => {
      cancelled = true;
    };
  }, [imageUrl, adaptiveGroove, onImageLoad, updateFrameSize]);

  useLayoutEffect(() => {
    const well = wellRef.current;
    if (!well || !imageUrl || !imageDisplayable || !adaptiveGroove)
      return undefined;
    const ro = new ResizeObserver(() => {
      const img = well.querySelector("img.neu-card-image-display");
      if (img?.complete && img.naturalWidth) updateFrameSize(img);
    });
    ro.observe(well);
    return () => ro.disconnect();
  }, [imageUrl, imageDisplayable, adaptiveGroove, updateFrameSize]);

  return {
    wellRef,
    frameSize,
    imageDisplayable,
    onImageLoad,
    onImageError,
  };
}
