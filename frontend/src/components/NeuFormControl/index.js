import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { DatePicker, Input, InputNumber, Select } from "antd";
import { createNeuButton } from "../NeuButton";
import {
  attachNeuSelectPopup,
  mapNeuSelectOptions,
  NEU_SELECT_POPUP_MARKER,
} from "./selectPopup";
import {
  setupPickerCellPress,
  syncPickerPopup,
} from "./pickerPopup";

/** Default width for controls inside vertical Form.Item layouts */
export const NEU_CONTROL_FULL_WIDTH = { width: "100%" };

/** Inset shadow for focus — matches --inset in neumorphism.css */
export const NEU_INSET_ACTIVE_SHADOW =
  "inset 2px 2px 5px #b8b9be, inset -3px -3px 7px #ffffff";

/** Select focus uses outline ring token — embed inset as extra shadow layers */
export const NEU_SELECT_ACTIVE_SHADOW = `transparent, ${NEU_INSET_ACTIVE_SHADOW}`;

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

function resolveSearchEnterButton(enterButton) {
  if (enterButton === false) return false;
  if (typeof enterButton === "string") {
    return createNeuButton({ variant: "primary", children: enterButton });
  }
  if (React.isValidElement(enterButton)) {
    return enterButton;
  }
  return createNeuButton({
    icon: <SearchOutlined />,
    "aria-label": "search",
  });
}

const NeuInputSearch = React.forwardRef(function NeuInputSearch(
  { enterButton = true, fullWidth = false, style, ...props },
  ref,
) {
  return (
    <Input.Search
      ref={ref}
      style={neuControlStyle(style, fullWidth)}
      enterButton={resolveSearchEnterButton(enterButton)}
      {...props}
    />
  );
});
NeuInputSearch.displayName = "NeuInput.Search";

const NeuInputBase = createNeuControl(Input, "NeuInput", { defaultFullWidth: false });
NeuInputBase.TextArea = createNeuInputVariant(Input.TextArea, "NeuInput.TextArea");
NeuInputBase.Password = createNeuInputVariant(
  Input.Password,
  "NeuInput.Password"
);
NeuInputBase.Search = NeuInputSearch;

/**
 * Neumorphic form controls — layout defaults; theme tokens via root ConfigProvider.
 * Raised/inset visuals: styles/neumorphism.css
 */
export const NeuInput = NeuInputBase;

function buildNeuSelectPopupClass(
  popupClassRef,
  popupClassName,
  dropdownClassName,
  classNamesRoot
) {
  return [
    NEU_SELECT_POPUP_MARKER,
    popupClassRef.current,
    popupClassName,
    dropdownClassName,
    classNamesRoot,
  ]
    .filter(Boolean)
    .join(" ");
}

const NeuSelectOption = Select.Option;

export const NeuSelect = React.forwardRef(function NeuSelect(
  {
    fullWidth = true,
    style,
    classNames,
    popupClassName,
    dropdownClassName,
    options,
    onOpenChange,
    ...props
  },
  ref
) {
  const popupClassRef = React.useRef(
    `neu-select-popup-${Math.random().toString(36).slice(2)}`
  );
  const optionPressCleanupRef = React.useRef(null);
  const mergedPopupClass = buildNeuSelectPopupClass(
    popupClassRef,
    popupClassName,
    dropdownClassName,
    classNames?.popup?.root
  );
  const neuOptions = React.useMemo(() => mapNeuSelectOptions(options), [options]);
  const mergedClassNames = React.useMemo(
    () => ({
      ...classNames,
      popup: {
        ...classNames?.popup,
        root: mergedPopupClass,
      },
    }),
    [classNames, mergedPopupClass]
  );

  React.useEffect(
    () => () => {
      optionPressCleanupRef.current?.();
    },
    []
  );

  const handleOpenChange = (open, ...rest) => {
    if (open) {
      requestAnimationFrame(() => {
        optionPressCleanupRef.current?.();
        optionPressCleanupRef.current =
          attachNeuSelectPopup(popupClassRef.current) ?? null;
      });
    } else {
      optionPressCleanupRef.current?.();
      optionPressCleanupRef.current = null;
    }
    onOpenChange?.(open, ...rest);
  };

  return (
    <Select
      ref={ref}
      style={neuControlStyle(style, fullWidth)}
      classNames={mergedClassNames}
      {...(neuOptions ? { options: neuOptions } : {})}
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
});
NeuSelect.displayName = "NeuSelect";
NeuSelect.Option = NeuSelectOption;
NeuSelect.OptGroup = Select.OptGroup;

export const NeuDatePicker = React.forwardRef(function NeuDatePicker(
  {
    fullWidth = true,
    style,
    onOpenChange,
    onPanelChange,
    classNames,
    popupClassName,
    cellRender: userCellRender,
    ...props
  },
  ref
) {
  const popupClassRef = React.useRef(
    `neu-date-picker-popup-${Math.random().toString(36).slice(2)}`
  );
  const cellPressCleanupRef = React.useRef(null);

  const neuCellRender = React.useCallback(
    (date, info) => {
      const node = userCellRender?.(date, info) ?? info.originNode;
      if (!React.isValidElement(node)) return node;

      return React.cloneElement(node, {
        className: [node.props.className, "neu-picker-date-cell"]
          .filter(Boolean)
          .join(" "),
      });
    },
    [userCellRender]
  );

  const runPopupSync = React.useCallback(() => {
    const popup = document.querySelector(`.${popupClassRef.current}`);
    syncPickerPopup(popup);
  }, []);

  const attachPopup = React.useCallback(
    (attempt = 0) => {
      const popup = document.querySelector(`.${popupClassRef.current}`);
      if (!popup) {
        if (attempt < 12) requestAnimationFrame(() => attachPopup(attempt + 1));
        return;
      }
      runPopupSync();
      cellPressCleanupRef.current?.();
      cellPressCleanupRef.current = setupPickerCellPress(popup);
    },
    [runPopupSync]
  );

  React.useEffect(
    () => () => {
      cellPressCleanupRef.current?.();
    },
    []
  );

  const mergedPopupClass = [popupClassRef.current, popupClassName, classNames?.popup?.root]
    .filter(Boolean)
    .join(" ");
  const mergedClassNames = React.useMemo(
    () => ({
      ...classNames,
      popup: {
        ...classNames?.popup,
        root: mergedPopupClass,
      },
    }),
    [classNames, mergedPopupClass]
  );

  const handleOpenChange = (open, ...rest) => {
    if (open) {
      requestAnimationFrame(attachPopup);
    } else {
      cellPressCleanupRef.current?.();
      cellPressCleanupRef.current = null;
    }
    onOpenChange?.(open, ...rest);
  };

  const handlePanelChange = (value, mode) => {
    requestAnimationFrame(runPopupSync);
    onPanelChange?.(value, mode);
  };

  return (
    <DatePicker
      ref={ref}
      style={neuControlStyle(style, fullWidth)}
      onOpenChange={handleOpenChange}
      onPanelChange={handlePanelChange}
      classNames={mergedClassNames}
      cellRender={neuCellRender}
      {...props}
    />
  );
});
NeuDatePicker.displayName = "NeuDatePicker";

export const NeuInputNumber = createNeuControl(InputNumber, "NeuInputNumber");
