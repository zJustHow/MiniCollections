import { useCallback, useLayoutEffect, useRef, useState } from "react";

export const WELL_INSET_PX = 6;
export const GROOVE_PAD_PX = 4;

export function useAdaptiveImageFrame(
  imageUrl,
  {
    coverMode = false,
    adaptiveGroove = true,
    wellInset = WELL_INSET_PX,
    groovePad = GROOVE_PAD_PX,
  } = {},
) {
  const wellRef = useRef(null);
  const [frameSize, setFrameSize] = useState(null);
  const [imageDisplayable, setImageDisplayable] = useState(false);

  const updateFrameSize = useCallback(
    (img) => {
      const well = wellRef.current;
      if (!well || !img?.naturalWidth) {
        setFrameSize(null);
        return;
      }
      const maxW = well.clientWidth - wellInset * 2 - groovePad * 2;
      const maxH = well.clientHeight - wellInset * 2 - groovePad * 2;
      if (coverMode) {
        setFrameSize({
          width: maxW + groovePad * 2,
          height: maxH + groovePad * 2,
        });
        return;
      }
      const scale = Math.min(
        maxW / img.naturalWidth,
        maxH / img.naturalHeight,
      );
      setFrameSize({
        width: Math.round(img.naturalWidth * scale) + groovePad * 2,
        height: Math.round(img.naturalHeight * scale) + groovePad * 2,
      });
    },
    [coverMode, wellInset, groovePad],
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

  // Reset in layout so we can re-sync cached preloads before paint. A post-paint
  // useEffect reset races with synchronous onLoad on back-navigation and leaves
  // below-the-fold cards stuck on the placeholder.
  useLayoutEffect(() => {
    setImageDisplayable(false);
    setFrameSize(null);

    if (!imageUrl) return undefined;

    let cancelled = false;
    const syncFromPreload = () => {
      if (cancelled) return;
      const preload = wellRef.current?.querySelector("img.neu-card-image-preload");
      if (preload?.complete && preload.naturalWidth > 0) {
        onImageLoad({ currentTarget: preload });
      }
    };

    syncFromPreload();
    const frameId = requestAnimationFrame(syncFromPreload);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [imageUrl, onImageLoad]);

  useLayoutEffect(() => {
    const well = wellRef.current;
    if (!well || !imageUrl || !imageDisplayable || !adaptiveGroove) return undefined;
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
