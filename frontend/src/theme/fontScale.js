import { useEffect, useState } from "react";

/** Keep in sync with --neu-font-scale breakpoints in skeuomorphic.css */
export function getNeuFontScale(width = typeof window !== "undefined" ? window.innerWidth : 1920) {
  if (width <= 640) return 0.875;
  if (width <= 992) return 0.9375;
  return 1;
}

export function scaleFontSize(px, scale) {
  return Math.round(px * scale);
}

/** Use in inline styles so font sizes follow html rem scaling */
export function neuRem(px) {
  return `${px / 16}rem`;
}

export function useNeuFontScale() {
  const [scale, setScale] = useState(() => getNeuFontScale());

  useEffect(() => {
    const onResize = () => setScale(getNeuFontScale());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return scale;
}

/** Ant Design token font sizes — scale together with html rem base */
export function buildAntdFontTokens(scale) {
  const fs = (px) => scaleFontSize(px, scale);
  return {
    fontSize: fs(14),
    fontSizeSM: fs(12),
    fontSizeLG: fs(16),
    fontSizeXL: fs(20),
    fontSizeHeading1: fs(38),
    fontSizeHeading2: fs(30),
    fontSizeHeading3: fs(24),
    fontSizeHeading4: fs(20),
    fontSizeHeading5: fs(16),
  };
}
