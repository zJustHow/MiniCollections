/** Injected after antd css-in-js — beats dynamic style order. */
const STYLE_ID = "neu-picker-cell-runtime";

const CELL_ACCENT = `
  background-color: var(--neu-accent-light) !important;
  color: #fff !important;
  box-shadow: var(--inset-accent) !important;
`;

const CELL_DISMISSED = `
  background-color: transparent !important;
  color: #2a354f !important;
  box-shadow: none !important;
`;

const CSS = `
.ant-picker-dropdown .ant-picker-cell-today .ant-picker-cell-inner::before {
  display: none !important;
}
.ant-picker-dropdown
  .ant-picker-cell-in-view.ant-picker-cell-today:not(.ant-picker-cell-selected):not(
    .ant-picker-cell-range-start
  ):not(.ant-picker-cell-range-end):not(.ant-picker-cell-disabled):not([data-neu-pressed])
  .ant-picker-cell-inner.neu-picker-date-cell {
  box-shadow: inset 0 0 0 1px var(--neu-accent) !important;
}
.ant-picker-dropdown .ant-picker-cell .ant-picker-cell-inner {
  background-color: transparent !important;
  color: #2a354f !important;
  transition: none !important;
}
.ant-picker-dropdown .ant-picker-cell[data-neu-pressed]::before,
.ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected::before,
.ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-start::before,
.ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-end::before {
  display: none !important;
}
.ant-picker-dropdown
  .ant-picker-cell-in-view:not(.ant-picker-cell-selected):not(
    .ant-picker-cell-range-start
  ):not(.ant-picker-cell-range-end):not(.ant-picker-cell-disabled):not(
    [data-neu-pressed]
  ):hover
  .ant-picker-cell-inner.neu-picker-date-cell {
  background-color: transparent !important;
  color: var(--neu-text-2) !important;
  box-shadow: inset 1px 1px 3px #b8b9be !important;
}
.ant-picker-dropdown
  .ant-picker-cell:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(
    .ant-picker-cell-range-end
  ):not(.ant-picker-cell-today):not([data-neu-pressed])
  .ant-picker-cell-inner.neu-picker-date-cell {
  background-color: transparent !important;
  box-shadow: none !important;
}
.ant-picker-dropdown
  .ant-picker-cell-in-view.ant-picker-cell-selected:not([data-neu-prev-selected])
  .ant-picker-cell-inner,
.ant-picker-dropdown
  .ant-picker-cell-in-view.ant-picker-cell-range-start:not([data-neu-prev-selected])
  .ant-picker-cell-inner,
.ant-picker-dropdown
  .ant-picker-cell-in-view.ant-picker-cell-range-end:not([data-neu-prev-selected])
  .ant-picker-cell-inner,
.ant-picker-dropdown .ant-picker-cell[data-neu-pressed] .ant-picker-cell-inner.neu-picker-date-cell {
  ${CELL_ACCENT}
}
.ant-picker-dropdown
  .ant-picker-cell-in-view.ant-picker-cell-selected[data-neu-prev-selected]
  .ant-picker-cell-inner,
.ant-picker-dropdown
  .ant-picker-cell-in-view.ant-picker-cell-range-start[data-neu-prev-selected]
  .ant-picker-cell-inner,
.ant-picker-dropdown
  .ant-picker-cell-in-view.ant-picker-cell-range-end[data-neu-prev-selected]
  .ant-picker-cell-inner {
  ${CELL_DISMISSED}
}
`;

export function mountPickerCellRuntimeStyle() {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
    return;
  }
  document.head.appendChild(el);
}
