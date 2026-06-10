import React from "react";
import { Radio } from "antd";

function mergeNeuRadioClass(className) {
  return ["neu-radio", className].filter(Boolean).join(" ");
}

function mergeNeuRadioGroupClass(className) {
  return ["neu-radio-group", className].filter(Boolean).join(" ");
}

function mergeNeuFilterGroupClass(className) {
  return ["neu-filter-options-inset", "neu-radio-filter-track", className]
    .filter(Boolean)
    .join(" ");
}

export const NeuRadio = React.forwardRef(function NeuRadio(
  { className, ...props },
  ref,
) {
  return (
    <Radio ref={ref} className={mergeNeuRadioClass(className)} {...props} />
  );
});

NeuRadio.Group = function NeuRadioGroup({ className, ...props }) {
  return (
    <Radio.Group className={mergeNeuRadioGroupClass(className)} {...props} />
  );
};

NeuRadio.FilterGroup = function NeuFilterGroup({ className, children }) {
  return (
    <div className={mergeNeuFilterGroupClass(className)}>{children}</div>
  );
};

NeuRadio.FilterOption = function NeuFilterOption({
  checked = false,
  onClick,
  label,
  count,
  className,
}) {
  const handleActivate = () => {
    onClick?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className={["neu-radio-filter-option", className].filter(Boolean).join(" ")}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <NeuRadio checked={checked} tabIndex={-1} />
      <span className="neu-filter-option-body">
        <span className="neu-filter-option-label">{label}</span>
        <span className="neu-filter-option-count">{count}</span>
      </span>
    </div>
  );
};

NeuRadio.Button = Radio.Button;

export default NeuRadio;
