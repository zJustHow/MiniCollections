import React from "react";
import { DatePicker, Input, InputNumber, Select } from "antd";

/** Default width for controls inside vertical Form.Item layouts */
export const NEU_CONTROL_FULL_WIDTH = { width: "100%" };

/** Inset shadow for focus — matches --inset in skeuomorphic.css */
export const NEU_INSET_ACTIVE_SHADOW =
  "inset 2px 2px 5px #b8b9be, inset -3px -3px 7px #ffffff";

const neuFieldBorder = {
  colorBorder: "#fcfbf8",
  hoverBorderColor: "#fcfbf8",
  activeBorderColor: "#fcfbf8",
};

/** Merged once in LocaleContext ConfigProvider — do not wrap each Neu* separately */
export const neuFormControlComponents = {
  Input: {
    ...neuFieldBorder,
    activeShadow: NEU_INSET_ACTIVE_SHADOW,
  },
  Select: {
    ...neuFieldBorder,
    selectorBg: "#fcfbf8",
    activeOutlineColor: "rgba(252, 251, 248, 0)",
  },
  InputNumber: {
    ...neuFieldBorder,
    activeShadow: NEU_INSET_ACTIVE_SHADOW,
  },
  DatePicker: {
    colorBgContainer: "#fcfbf8",
    colorBgElevated: "#fcfbf8",
    colorText: "#44476A",
    colorTextHeading: "#2a354f",
    colorTextDisabled: "#66799e",
    colorIcon: "#66799e",
    colorIconHover: "#5592cc",
    ...neuFieldBorder,
    activeShadow: NEU_INSET_ACTIVE_SHADOW,
    cellHoverBg: "rgba(230, 231, 238, 0.1)",
    cellActiveWithRangeBg: "rgba(85, 146, 204, 0.12)",
  },
};

/** Spread into app root ConfigProvider (see LocaleContext.js) */
export const neuFormControlTheme = {
  token: {
    controlOutlineWidth: 0,
  },
  components: neuFormControlComponents,
};

export function neuControlStyle(style, fullWidth = true) {
  if (!fullWidth) return style;
  return style ? { ...NEU_CONTROL_FULL_WIDTH, ...style } : NEU_CONTROL_FULL_WIDTH;
}

function createNeuControl(Component, displayName, { defaultFullWidth = true } = {}) {
  const Neu = React.forwardRef(function NeuControl(
    { fullWidth = defaultFullWidth, style, ...props },
    ref
  ) {
    return (
      <Component
        ref={ref}
        style={neuControlStyle(style, fullWidth)}
        {...props}
      />
    );
  });
  Neu.displayName = displayName;
  return Neu;
}

function createNeuInputVariant(Component, displayName) {
  return createNeuControl(Component, displayName, { defaultFullWidth: false });
}

const NeuInputBase = createNeuControl(Input, "NeuInput", { defaultFullWidth: false });
NeuInputBase.TextArea = createNeuInputVariant(Input.TextArea, "NeuInput.TextArea");
NeuInputBase.Password = createNeuInputVariant(
  Input.Password,
  "NeuInput.Password"
);
NeuInputBase.Search = createNeuInputVariant(Input.Search, "NeuInput.Search");

/**
 * Neumorphic form controls — layout defaults; theme tokens via root ConfigProvider.
 * Raised/inset visuals: styles/skeuomorphic.css
 */
export const NeuInput = NeuInputBase;

export const NeuSelect = createNeuControl(Select, "NeuSelect");
NeuSelect.Option = Select.Option;
NeuSelect.OptGroup = Select.OptGroup;

export const NeuDatePicker = createNeuControl(DatePicker, "NeuDatePicker");

export const NeuInputNumber = createNeuControl(InputNumber, "NeuInputNumber");
