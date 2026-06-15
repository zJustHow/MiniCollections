/** Viewport tier for phone-native — mirrors web `max-width: 640px` (`--neu-font-scale: 0.875`). */
export const NEU_FONT_SCALE_MOBILE = 0.875;

export function scaleFontSize(
  px: number,
  scale: number = NEU_FONT_SCALE_MOBILE,
): number {
  return Math.round(px * scale);
}

/** Loaded via `@expo-google-fonts/nunito-sans` on mobile. */
export const neuFontFamily = {
  regular: "NunitoSans_400Regular",
  semiBold: "NunitoSans_600SemiBold",
} as const;

export const neuFontWeight = {
  regular: "400" as const,
  semiBold: "600" as const,
};

/** Nominal `--neu-fs-*` sizes scaled for mobile (keep in sync with frontend typography.css). */
export const neuFontSize = {
  fs8: scaleFontSize(8),
  fs10: scaleFontSize(10),
  fs11: scaleFontSize(11),
  fs12: scaleFontSize(12),
  fs13: scaleFontSize(13),
  fs14: scaleFontSize(14),
  fs15: scaleFontSize(15),
  fs16: scaleFontSize(16),
  fs17: scaleFontSize(17),
  fs18: scaleFontSize(18),
  fs20: scaleFontSize(20),
  fs22: scaleFontSize(22),
  fs36: scaleFontSize(36),
  size28: scaleFontSize(28),
} as const;

export const neuLetterSpacing = {
  button: 0.35,
  nameplateTitle: 0.3,
  nameplateSubtitle: 0.2,
  authTitle: 2,
  headerLogo: 2.5,
} as const;

export const neuLineHeight = {
  panelBody: 1.6,
  nameplateSubtitle: 1.25,
  nameplateTitle: 1.35,
} as const;

/** Matches web `--neu-nameplate-subtitle-slot: calc(var(--neu-fs-11) * 1.25 + 2px)`. */
export const nameplateSubtitleSlotHeight =
  neuFontSize.fs11 * neuLineHeight.nameplateSubtitle + 2;

/** @deprecated Prefer `neuFontSize` — kept for existing imports. */
export const typography = {
  titleSize: neuFontSize.fs22,
  bodySize: neuFontSize.fs14,
  captionSize: neuFontSize.fs13,
};
