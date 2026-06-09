import React from "react";
import { Select } from "antd";
import {
  attachNeuSelectPopup,
  mapNeuSelectOptions,
  NEU_SELECT_POPUP_MARKER,
} from "./selectPopup.js";
import { neuControlStyle } from "./shared.js";

function buildNeuSelectPopupClass(
  popupClassRef,
  popupClassName,
  dropdownClassName,
  classNamesRoot,
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
  ref,
) {
  const popupClassRef = React.useRef(
    `neu-select-popup-${Math.random().toString(36).slice(2)}`,
  );
  const optionPressCleanupRef = React.useRef(null);
  const mergedPopupClass = buildNeuSelectPopupClass(
    popupClassRef,
    popupClassName,
    dropdownClassName,
    classNames?.popup?.root,
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
    [classNames, mergedPopupClass],
  );

  React.useEffect(
    () => () => {
      optionPressCleanupRef.current?.();
    },
    [],
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
