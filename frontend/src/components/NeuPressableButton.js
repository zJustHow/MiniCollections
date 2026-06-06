import { forwardRef } from "react";

export function buildPressableClassName({
  variant = "panel-tab",
  filter = false,
  danger = false,
  active = false,
  className = "",
} = {}) {
  return [
    "neu-pressable-btn",
    variant === "header-bar" && "neu-header-bar-btn",
    variant === "panel-tab" && "neu-panel-tab-btn",
    filter && "neu-filter-tab-option",
    danger && "neu-pressable-btn--danger",
    active && "active",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Native pressable button — Layer 1 base + Layer 2 variant.
 * Use variant="panel-tab" for tabs/filters; variant="header-bar" for top bar actions.
 */
const NeuPressableButton = forwardRef(function NeuPressableButton(
  {
    variant = "panel-tab",
    filter = false,
    danger = false,
    active = false,
    className = "",
    type = "button",
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buildPressableClassName({
        variant,
        filter,
        danger,
        active,
        className,
      })}
      {...props}
    >
      {children}
    </button>
  );
});

export default NeuPressableButton;
