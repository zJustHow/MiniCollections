import React from "react";
import { DatePicker, Input, InputNumber, Select } from "antd";
import {
  mountPickerCellRuntimeStyle,
  unmountPickerCellRuntimeStyle,
} from "./pickerCellStyles";

/** Default width for controls inside vertical Form.Item layouts */
export const NEU_CONTROL_FULL_WIDTH = { width: "100%" };

/** Inset shadow for focus — matches --inset in skeuomorphic.css */
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

const PICKER_TAB_BTN_SELECTOR = [
  ".ant-picker-month-btn",
  ".ant-picker-year-btn",
  ".ant-picker-header-prev-btn",
  ".ant-picker-header-next-btn",
  ".ant-picker-header-super-prev-btn",
  ".ant-picker-header-super-next-btn",
  ".ant-picker-today-btn",
  ".ant-picker-now-btn",
].join(", ");

function decoratePickerTabButtons(root) {
  if (!root) return;

  root.querySelectorAll(PICKER_TAB_BTN_SELECTOR).forEach((btn) => {
    btn.classList.add("neu-pressable-btn", "neu-panel-tab-btn");
  });
}

function setupPickerCellPress(popupClass) {
  const onMouseDown = (event) => {
    const popup = document.querySelector(`.${popupClass}`);
    if (!popup?.contains(event.target)) return;

    const cell = event.target.closest(
      ".ant-picker-cell-in-view:not(.ant-picker-cell-disabled)"
    );
    if (!cell || !popup.contains(cell)) return;

    popup.querySelectorAll("[data-neu-pressed]").forEach((other) => {
      if (other !== cell) other.removeAttribute("data-neu-pressed");
    });

    if (!cell.classList.contains("ant-picker-cell-selected")) {
      cell.setAttribute("data-neu-pressed", "");
    }
  };

  document.addEventListener("mousedown", onMouseDown, true);

  return () => {
    document.removeEventListener("mousedown", onMouseDown, true);
    document
      .querySelector(`.${popupClass}`)
      ?.querySelectorAll("[data-neu-pressed]")
      .forEach((cell) => cell.removeAttribute("data-neu-pressed"));
  };
}

export const NeuDatePicker = React.forwardRef(function NeuDatePicker(
  {
    fullWidth = true,
    style,
    onOpenChange,
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
  const tabObserverRef = React.useRef(null);
  const cellPressCleanupRef = React.useRef(null);

  const neuCellRender = React.useCallback(
    (date, info) => {
      const node = userCellRender?.(date, info) ?? info.originNode;
      if (!React.isValidElement(node)) return node;
      const className = [node.props.className, "neu-picker-date-cell"]
        .filter(Boolean)
        .join(" ");
      return React.cloneElement(node, { className });
    },
    [userCellRender]
  );

  const syncPickerPopup = React.useCallback(() => {
    mountPickerCellRuntimeStyle();
    const popup = document.querySelector(`.${popupClassRef.current}`);
    decoratePickerTabButtons(popup);
  }, []);

  const stopObserving = React.useCallback(() => {
    tabObserverRef.current?.disconnect();
    tabObserverRef.current = null;
    cellPressCleanupRef.current?.();
    cellPressCleanupRef.current = null;
    unmountPickerCellRuntimeStyle();
  }, []);

  const startObserving = React.useCallback(() => {
    const attach = (attempt = 0) => {
      const popup = document.querySelector(`.${popupClassRef.current}`);
      if (!popup) {
        if (attempt < 12) requestAnimationFrame(() => attach(attempt + 1));
        return;
      }

      syncPickerPopup();

      tabObserverRef.current?.disconnect();
      tabObserverRef.current = new MutationObserver(syncPickerPopup);
      tabObserverRef.current.observe(popup, { childList: true, subtree: true });

      cellPressCleanupRef.current?.();
      cellPressCleanupRef.current = setupPickerCellPress(popupClassRef.current);
    };

    attach();
  }, [syncPickerPopup]);

  React.useEffect(() => () => stopObserving(), [stopObserving]);

  const mergedPopupClass = [popupClassRef.current, popupClassName, classNames?.popup?.root]
    .filter(Boolean)
    .join(" ");

  const handleOpenChange = (open, ...rest) => {
    if (open) {
      requestAnimationFrame(startObserving);
    } else {
      stopObserving();
    }
    onOpenChange?.(open, ...rest);
  };

  return (
    <DatePicker
      ref={ref}
      style={neuControlStyle(style, fullWidth)}
      onOpenChange={handleOpenChange}
      popupClassName={mergedPopupClass}
      classNames={classNames}
      cellRender={neuCellRender}
      {...props}
    />
  );
});
NeuDatePicker.displayName = "NeuDatePicker";

export const NeuInputNumber = createNeuControl(InputNumber, "NeuInputNumber");
