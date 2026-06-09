import { NEU_INSET_ACTIVE_SHADOW, NEU_SELECT_ACTIVE_SHADOW } from "./shared.js";

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
    activeOutlineColor: NEU_SELECT_ACTIVE_SHADOW,
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
    colorPrimary: "#6aa8dc",
    colorTextLightSolid: "#ffffff",
    motionDurationMid: "0s",
    ...neuFieldBorder,
    activeShadow: NEU_INSET_ACTIVE_SHADOW,
    cellHoverBg: "transparent",
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
