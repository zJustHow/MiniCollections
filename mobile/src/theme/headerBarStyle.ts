import { Platform, StatusBar } from "react-native";
import { colors, neuBoxShadow } from "@minicollections/theme";
import type { NeuShadowStyle } from "@minicollections/theme";

/** Matches web `--header-height-mobile`. */
export const HEADER_HEIGHT = 64;
export const HEADER_PADDING_X = 14;
/** Header action icons — keep all top-bar glyphs on one optical size. */
export const HEADER_BAR_ICON_SIZE = 20;
export const HEADER_BAR_BUTTON_PADDING_X = 16;
export const HEADER_BAR_ACTION_MIN_WIDTH = 48;

/** Safe-area top inset with an Android status-bar fallback when insets are 0. */
export function getTopSafeInset(topInset = 0) {
  const androidStatusBar =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
  return Math.max(topInset, androidStatusBar);
}

export function getAppTopBarHeight(topInset = 0) {
  return HEADER_HEIGHT + getTopSafeInset(topInset);
}

export function neuHeaderBarStyle(options: {
  active?: boolean;
  pressed?: boolean;
}): NeuShadowStyle {
  const { active = false, pressed = false } = options;

  if (active) {
    return {
      backgroundColor: colors.accentLight,
      boxShadow: neuBoxShadow.insetAccent,
      borderWidth: 1,
      borderColor: colors.bg,
    };
  }

  if (pressed) {
    return {
      backgroundColor: colors.bg,
      boxShadow: neuBoxShadow.insetSm,
      borderWidth: 1,
      borderColor: colors.bg,
    };
  }

  return {
    backgroundColor: "transparent",
    borderWidth: 0,
  };
}
