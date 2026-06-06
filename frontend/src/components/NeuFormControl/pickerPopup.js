import { mountPickerCellRuntimeStyle } from "./pickerCellStyles";

const TAB_BTN_SELECTOR = [
  ".ant-picker-month-btn",
  ".ant-picker-year-btn",
  ".ant-picker-header-prev-btn",
  ".ant-picker-header-next-btn",
  ".ant-picker-header-super-prev-btn",
  ".ant-picker-header-super-next-btn",
  ".ant-picker-today-btn",
  ".ant-picker-now-btn",
].join(", ");

const SELECTED_CELL_SELECTOR = [
  ".ant-picker-cell-selected",
  ".ant-picker-cell-range-start",
  ".ant-picker-cell-range-end",
].join(", ");

function decoratePickerTabButtons(root) {
  root?.querySelectorAll(TAB_BTN_SELECTOR).forEach((btn) => {
    if (!btn.classList.contains("neu-pressable-btn")) {
      btn.classList.add("neu-pressable-btn", "neu-panel-tab-btn");
    }
  });
}

function clearAllPressMarks(popup) {
  popup?.querySelectorAll(".ant-picker-cell").forEach((cell) => {
    cell.removeAttribute("data-neu-pressed");
    cell.removeAttribute("data-neu-prev-selected");
  });
}

export function syncPickerPopup(popup) {
  mountPickerCellRuntimeStyle();
  decoratePickerTabButtons(popup);
}

export function setupPickerCellPress(popup) {
  if (!popup) return () => {};

  let armed = false;

  const releasePress = () => {
    if (!armed) return;
    armed = false;
    clearAllPressMarks(popup);
  };

  const onMouseDown = (event) => {
    if (!popup.contains(event.target)) return;

    const cell = event.target.closest(
      ".ant-picker-cell-in-view:not(.ant-picker-cell-disabled)",
    );
    if (!cell || !popup.contains(cell)) return;

    mountPickerCellRuntimeStyle();
    armed = true;
    clearAllPressMarks(popup);

    popup.querySelectorAll(SELECTED_CELL_SELECTOR).forEach((selectedCell) => {
      if (selectedCell !== cell) {
        selectedCell.setAttribute("data-neu-prev-selected", "");
      }
    });

    cell.setAttribute("data-neu-pressed", "");
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
