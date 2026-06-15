import { colors } from "./tokens";

/**
 * CSS box-shadow strings — keep in sync with frontend/src/styles/neumorphism/tokens.css
 * Mobile applies these via React Native `boxShadow` (New Architecture).
 */
export const neuBoxShadow = {
  raised: `6px 6px 12px ${colors.sd}, -6px -6px 12px ${colors.sl}`,
  raisedLg: `8px 8px 16px ${colors.sd}, -8px -8px 16px ${colors.sl}`,
  raisedSm: `3px 3px 6px ${colors.sd}, -3px -3px 6px ${colors.sl}`,
  raisedXs: `1px 1px 3px ${colors.sd}, -1px -1px 3px ${colors.sl}`,
  /** Bottom bars — Y-flipped raised-sm */
  raisedSmUp: `-3px -3px 6px ${colors.sd}, 3px 3px 6px ${colors.sl}`,
  inset: `inset 2px 2px 5px ${colors.sd}, inset -3px -3px 7px ${colors.sl}`,
  insetSm: `inset 1px 1px 3px ${colors.sd}, inset -2px -2px 4px ${colors.sl}`,
  insetLg: `inset 4px 4px 10px ${colors.sd}, inset -5px -5px 12px ${colors.sl}`,
  insetAvatar: `inset 2px 2px 6px ${colors.sd}`,
  insetAccent: `inset 2px 2px 5px ${colors.accentDark}, inset -3px -3px 7px ${colors.accentLighter}`,
  insetAccentSm: `inset 1px 1px 3px ${colors.accentDark}, inset -2px -2px 4px ${colors.accentLighter}`,
  insetDanger: `inset 2px 2px 5px ${colors.dangerDark}, inset -3px -3px 7px ${colors.dangerLighter}`,
  insetDangerSm: `inset 1px 1px 3px ${colors.dangerDark}, inset -2px -2px 4px ${colors.dangerLighter}`,
} as const;

export const neuMotion = {
  btnScaleHover: 0.98,
  cardHoverScale: 1.01,
  cardActiveScale: 0.99,
} as const;

/** Layout tokens — keep in sync with frontend cards-images.css */
export const neuImageLayout = {
  wellInset: 6,
  wellInsetThumb: 3,
  groovePad: 4,
  groovePadThumb: 2,
  detailAspectRatio: 4 / 3,
  coverAspectRatio: 1.6,
  /** Brand logo artwork scale inside fixed groove well */
  logoScale: 0.68,
} as const;

/** Offsets for stacked alpha-mask logo outlines (expo-image lacks CSS filter support). */
export type NeuLogoShadowLayer = {
  offsetX: number;
  offsetY: number;
  opacity: number;
};

export const neuLogoShadowLayers: NeuLogoShadowLayer[] = [
  // Crisp 1px ring — approximates web drop-shadow(0 0 1px rgba(0,0,0,0.35))
  { offsetX: -1, offsetY: 0, opacity: 0.2 },
  { offsetX: 1, offsetY: 0, opacity: 0.2 },
  { offsetX: 0, offsetY: -1, opacity: 0.2 },
  { offsetX: 0, offsetY: 1, opacity: 0.18 },
];

/**
 * Alpha-mask drop shadow for brand logos on light neumorphic wells (web CSS).
 * Mobile uses {@link neuLogoShadowLayers} because expo-image ignores RN `filter`.
 */
export const neuLogoDropShadow =
  "drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.35)) drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.2))";

/** CSS filter strings — keep in sync with frontend cards-images.css */
export const neuFilter = {
  logoDropShadow: neuLogoDropShadow,
} as const;
