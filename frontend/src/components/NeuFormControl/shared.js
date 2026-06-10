import React from "react";

/** Ensure native inputs have id or name for autofill and a11y audits. */
export function useNeuFieldIdentity({ id, name, prefix = "neu" }) {
  const generatedId = React.useId();
  if (id || name) {
    return { id, name };
  }
  return {
    id: `${prefix}-${generatedId.replace(/:/g, "")}`,
    name: undefined,
  };
}

/** Default width for controls inside vertical Form.Item layouts */
export const NEU_CONTROL_FULL_WIDTH = { width: "100%" };

/** Inset shadow for focus — matches --inset in neumorphism.css */
export const NEU_INSET_ACTIVE_SHADOW =
  "inset 2px 2px 5px #b8b9be, inset -3px -3px 7px #ffffff";

/** Select focus uses outline ring token — embed inset as extra shadow layers */
export const NEU_SELECT_ACTIVE_SHADOW = `transparent, ${NEU_INSET_ACTIVE_SHADOW}`;

export function neuControlStyle(style, fullWidth = true) {
  if (!fullWidth) return style;
  return style ? { ...NEU_CONTROL_FULL_WIDTH, ...style } : NEU_CONTROL_FULL_WIDTH;
}

export function createNeuControl(Component, displayName, { defaultFullWidth = true, idPrefix = "neu" } = {}) {
  const Neu = React.forwardRef(function NeuControl(
    { fullWidth = defaultFullWidth, style, id, name, ...props },
    ref,
  ) {
    const fieldIdentity = useNeuFieldIdentity({ id, name, prefix: idPrefix });
    return (
      <Component
        ref={ref}
        style={neuControlStyle(style, fullWidth)}
        {...fieldIdentity}
        {...props}
      />
    );
  });
  Neu.displayName = displayName;
  return Neu;
}
