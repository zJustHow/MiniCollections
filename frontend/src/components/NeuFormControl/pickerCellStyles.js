/** Injected after antd css-in-js so picker cell colors stay blue through mouseup. */
export const PICKER_CELL_RUNTIME_STYLE_ID = "neu-picker-cell-runtime";

export const PICKER_CELL_RUNTIME_CSS = `
.ant-picker-dropdown .ant-picker-cell-today .ant-picker-cell-inner::before {
  display: none !important;
}
.ant-picker-dropdown
  .ant-picker-cell-in-view:not(.ant-picker-cell-selected):not(
    .ant-picker-cell-range-start
  ):not(.ant-picker-cell-range-end):not(.ant-picker-cell-disabled):hover
  .neu-picker-date-cell {
  box-shadow: inset 1px 1px 3px #b8b9be !important;
}
.ant-picker-dropdown .ant-picker-cell[data-neu-pressed] .neu-picker-date-cell,
.ant-picker-dropdown
  .ant-picker-cell-in-view:not(.ant-picker-cell-disabled):active
  .neu-picker-date-cell,
.ant-picker-dropdown .ant-picker-cell-selected .neu-picker-date-cell,
.ant-picker-dropdown .ant-picker-cell-range-start .neu-picker-date-cell,
.ant-picker-dropdown .ant-picker-cell-range-end .neu-picker-date-cell {
  background: #5592cc !important;
  color: #fff !important;
  box-shadow: inset 2px 2px 4px #3d78b8 !important;
}
`;

export function mountPickerCellRuntimeStyle() {
  let el = document.getElementById(PICKER_CELL_RUNTIME_STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = PICKER_CELL_RUNTIME_STYLE_ID;
    document.head.appendChild(el);
  } else {
    document.head.appendChild(el);
  }
  el.textContent = PICKER_CELL_RUNTIME_CSS;
}

export function unmountPickerCellRuntimeStyle() {
  document.getElementById(PICKER_CELL_RUNTIME_STYLE_ID)?.remove();
}
