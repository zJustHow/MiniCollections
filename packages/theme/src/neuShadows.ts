import { neuBoxShadow, neuMotion } from "./neuShadowTokens";
import { colors } from "./tokens";

export type NeuRaisedSize = "xs" | "sm" | "lg";
export type NeuSurfaceTint = "default" | "accent" | "danger";
export type NeuControlVariant = "default" | "primary" | "danger";

export type NeuShadowStyle = {
  backgroundColor?: string;
  boxShadow?: string;
  borderWidth?: number;
  borderColor?: string;
  borderTopWidth?: number;
  borderTopColor?: string;
  opacity?: number;
  transform?: Array<{ scale: number }>;
};

const RAISED: Record<NeuRaisedSize, string> = {
  xs: neuBoxShadow.raisedXs,
  sm: neuBoxShadow.raisedSm,
  lg: neuBoxShadow.raisedLg,
};

const INSET_PRESSED: Record<NeuSurfaceTint, string> = {
  default: neuBoxShadow.insetSm,
  accent: neuBoxShadow.insetAccentSm,
  danger: neuBoxShadow.insetDangerSm,
};

const INSET_DISABLED: Record<NeuSurfaceTint, string> = {
  default: neuBoxShadow.inset,
  accent: neuBoxShadow.insetAccent,
  danger: neuBoxShadow.insetDanger,
};

/** Invisible border matching web `border: 1px solid var(--neu-bg)`. */
function neuBorder(
  variant: NeuControlVariant,
  pressed = false,
  disabled = false,
): Pick<NeuShadowStyle, "borderWidth" | "borderColor"> {
  if (variant === "primary") {
    if (disabled || pressed) {
      return { borderWidth: 1, borderColor: colors.accentLight };
    }
    return { borderWidth: 1, borderColor: colors.accent };
  }
  if (variant === "danger") {
    if (disabled || pressed) {
      return { borderWidth: 1, borderColor: colors.dangerLight };
    }
    return { borderWidth: 1, borderColor: colors.danger };
  }
  return { borderWidth: 1, borderColor: colors.bg };
}

/** Raised neumorphic shadow — mirrors web `--raised-sm` / `--raised-lg`. */
export function neuRaised(size: NeuRaisedSize = "sm"): NeuShadowStyle {
  return {
    boxShadow: RAISED[size],
    borderWidth: 1,
    borderColor: colors.bg,
  };
}

/** Inset neumorphic shadow — mirrors web `--inset-sm`. */
export function neuInset(tint: NeuSurfaceTint = "default"): NeuShadowStyle {
  return {
    boxShadow: INSET_PRESSED[tint],
    borderWidth: 1,
    borderColor: colors.bg,
  };
}

/** Upward raised shadow for bottom tab bar. */
export function neuRaisedUp(_size: NeuRaisedSize = "sm"): NeuShadowStyle {
  return {
    boxShadow: neuBoxShadow.raisedSmUp,
    borderTopWidth: 1,
    borderTopColor: colors.sl,
  };
}

function resolveTint(variant: NeuControlVariant): NeuSurfaceTint {
  if (variant === "primary") return "accent";
  if (variant === "danger") return "danger";
  return "default";
}

function resolveBackground(
  variant: NeuControlVariant,
  pressed: boolean,
  disabled: boolean,
): string {
  if (variant === "primary") {
    if (disabled) return colors.accentLight;
    if (pressed) return colors.accentLight;
    return colors.accent;
  }
  if (variant === "danger") {
    if (disabled) return colors.dangerLight;
    if (pressed) return colors.dangerLight;
    return colors.danger;
  }
  return colors.bg;
}

/** Interactive control surface — raised at rest, inset when pressed/focused. */
export function neuControlStyle(options: {
  variant?: NeuControlVariant;
  pressed?: boolean;
  disabled?: boolean;
  focused?: boolean;
  raisedSize?: NeuRaisedSize;
}): NeuShadowStyle {
  const {
    variant = "default",
    pressed = false,
    disabled = false,
    focused = false,
    raisedSize = "sm",
  } = options;
  const tint = resolveTint(variant);
  const backgroundColor = resolveBackground(variant, pressed, disabled);
  const border = neuBorder(variant, pressed || focused, disabled);

  if (disabled) {
    return {
      backgroundColor,
      boxShadow: INSET_DISABLED[tint],
      ...border,
    };
  }

  if (pressed || focused) {
    return {
      backgroundColor,
      boxShadow: INSET_PRESSED[tint],
      ...border,
      transform: [{ scale: neuMotion.btnScaleHover }],
    };
  }

  return {
    backgroundColor,
    boxShadow: RAISED[raisedSize],
    ...border,
  };
}

/** Card / tile surface — raised at rest, raised-xs when pressed (web neu-card). */
export function neuCardStyle(options: {
  pressed?: boolean;
  raisedSize?: NeuRaisedSize;
}): NeuShadowStyle {
  const { pressed = false, raisedSize = "sm" } = options;

  if (pressed) {
    return {
      backgroundColor: colors.bg,
      boxShadow: neuBoxShadow.raisedXs,
      borderWidth: 1,
      borderColor: colors.bg,
      transform: [{ scale: neuMotion.cardActiveScale }],
    };
  }

  return {
    backgroundColor: colors.bg,
    boxShadow: RAISED[raisedSize],
    borderWidth: 1,
    borderColor: colors.bg,
  };
}

/** Form field surface — raised at rest, inset-sm when focused. */
export function neuFieldStyle(options: {
  pressed?: boolean;
  focused?: boolean;
  disabled?: boolean;
}): NeuShadowStyle {
  const { pressed = false, focused = false, disabled = false } = options;

  if (disabled) {
    return {
      backgroundColor: colors.bg,
      boxShadow: neuBoxShadow.inset,
      borderWidth: 1,
      borderColor: colors.bg,
      opacity: 0.55,
    };
  }

  if (pressed || focused) {
    return {
      backgroundColor: colors.bg,
      boxShadow: neuBoxShadow.insetSm,
      borderWidth: 1,
      borderColor: colors.bg,
      transform: [{ scale: neuMotion.btnScaleHover }],
    };
  }

  return {
    backgroundColor: colors.bg,
    boxShadow: neuBoxShadow.raisedSm,
    borderWidth: 1,
    borderColor: colors.bg,
  };
}

export { neuBoxShadow, neuMotion } from "./neuShadowTokens";
