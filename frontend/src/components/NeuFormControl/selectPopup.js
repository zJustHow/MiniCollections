export const NEU_SELECT_POPUP_MARKER = "neu-select-dropdown";
export const NEU_SELECT_OPTION_CLASSES =
  "neu-pressable-btn neu-panel-tab-btn neu-select-option";

export function withNeuSelectOptionClassName(className) {
  return [NEU_SELECT_OPTION_CLASSES, className].filter(Boolean).join(" ");
}

export function mapNeuSelectOptions(options) {
  if (!options) return options;

  return options.map((option) => {
    if (option == null || typeof option !== "object") return option;
    if (Array.isArray(option.options)) {
      return {
        ...option,
        options: mapNeuSelectOptions(option.options),
      };
    }
    return {
      ...option,
      className: withNeuSelectOptionClassName(option.className),
    };
  });
}

function clearSelectPressMarks(popup) {
  popup?.querySelectorAll(".ant-select-item-option").forEach((item) => {
    item.removeAttribute("data-neu-pressed");
    item.removeAttribute("data-neu-prev-selected");
  });
}

export function decorateNeuSelectOptions(popup) {
  if (!popup) return;

  popup.querySelectorAll(".ant-select-item-option").forEach((item) => {
    NEU_SELECT_OPTION_CLASSES.split(" ").forEach((cls) => {
      item.classList.add(cls);
    });
    item.classList.toggle(
      "active",
      item.classList.contains("ant-select-item-option-selected") &&
        !item.hasAttribute("data-neu-prev-selected")
    );
  });
}

export function setupSelectOptionPress(popup) {
  if (!popup) return () => {};

  let armed = false;

  const releasePress = () => {
    if (!armed) return;
    armed = false;
    clearSelectPressMarks(popup);
    decorateNeuSelectOptions(popup);
  };

  const onMouseDown = (event) => {
    const item = event.target.closest(
      ".ant-select-item-option:not(.ant-select-item-option-disabled)"
    );
    if (!item || !popup.contains(item)) return;

    armed = true;
    clearSelectPressMarks(popup);

    popup
      .querySelectorAll(".ant-select-item-option-selected")
      .forEach((selected) => {
        if (selected !== item) {
          selected.setAttribute("data-neu-prev-selected", "");
          selected.classList.remove("active");
        }
      });

    item.setAttribute("data-neu-pressed", "");
    item.classList.add("active");
  };

  const onMouseUp = () => {
    if (!armed) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(releasePress);
    });
  };

  popup.addEventListener("mousedown", onMouseDown, true);
  document.addEventListener("mouseup", onMouseUp, true);
  return () => {
    armed = false;
    popup.removeEventListener("mousedown", onMouseDown, true);
    document.removeEventListener("mouseup", onMouseUp, true);
  };
}

export function attachNeuSelectPopup(popupClass, attempt = 0) {
  const popup = document.querySelector(`.${popupClass}`);
  if (!popup) {
    if (attempt < 12) {
      requestAnimationFrame(() => attachNeuSelectPopup(popupClass, attempt + 1));
    }
    return null;
  }
  decorateNeuSelectOptions(popup);
  return setupSelectOptionPress(popup);
}

/** @deprecated use attachNeuSelectPopup */
export function attachNeuSelectOptions(popupClass, attempt = 0) {
  attachNeuSelectPopup(popupClass, attempt);
}
