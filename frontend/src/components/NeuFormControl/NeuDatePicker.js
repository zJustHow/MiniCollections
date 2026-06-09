import React from "react";
import { DatePicker } from "antd";
import { setupPickerCellPress, syncPickerPopup } from "./pickerPopup.js";
import { neuControlStyle } from "./shared.js";

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
  ref,
) {
  const popupClassRef = React.useRef(
    `neu-date-picker-popup-${Math.random().toString(36).slice(2)}`,
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
    [userCellRender],
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
    [runPopupSync],
  );

  React.useEffect(
    () => () => {
      cellPressCleanupRef.current?.();
    },
    [],
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
    [classNames, mergedPopupClass],
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
