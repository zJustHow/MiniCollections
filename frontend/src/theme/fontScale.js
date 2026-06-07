import { useEffect, useState } from "react";

export const NEU_FONT_BASE_PX = 16;

const NEU_VP_SM_MAX = 640;
const NEU_VP_MD_MAX = 992;

export function getNeuFontScale() {
  if (typeof window === "undefined") return 1;
  if (window.matchMedia(`(max-width: ${NEU_VP_SM_MAX}px)`).matches) return 0.875;
  if (window.matchMedia(`(max-width: ${NEU_VP_MD_MAX}px)`).matches) return 0.9375;
  return 1;
}

export function scaleFontSize(px, scale) {
  return Math.round(px * scale);
}

/** Inline font sizes as rem (scales with html @media font-size in neumorphism.css) */
export function neuRem(px) {
  return `${px / NEU_FONT_BASE_PX}rem`;
}

export function useNeuFontScale() {
  const [scale, setScale] = useState(() => getNeuFontScale());

  useEffect(() => {
    const sync = () => setScale(getNeuFontScale());

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    window.visualViewport?.addEventListener("resize", sync);

    const mql992 = window.matchMedia(`(max-width: ${NEU_VP_MD_MAX}px)`);
    const mql640 = window.matchMedia(`(max-width: ${NEU_VP_SM_MAX}px)`);
    mql992.addEventListener("change", sync);
    mql640.addEventListener("change", sync);

    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      mql992.removeEventListener("change", sync);
      mql640.removeEventListener("change", sync);
    };
  }, []);

  return scale;
}

/** Ant Design token font sizes — scale with viewport tier */
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
