import { createElement, forwardRef } from "react";
import { LoadingOutlined } from "@ant-design/icons";

export function neuBtnProps({ className = "", ...props } = {}) {
  return {
    ...props,
    className: ["neu-btn", className].filter(Boolean).join(" "),
  };
}

function buildNeuClassName({ pagination, current, className }) {
  return [
    "neu-btn",
    pagination && "neu-btn--pagination",
    pagination && current && "neu-btn--pagination-current",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function resolveVariant(variant, type) {
  const resolved = type ?? variant;
  if (resolved === "primary" || resolved === "link" || resolved === "text") {
    return resolved;
  }
  return "default";
}

function resolveAntBtnVariantClass(variant) {
  switch (variant) {
    case "primary":
      return "ant-btn-primary";
    case "link":
      return "ant-btn-link";
    case "text":
      return "ant-btn-text";
    default:
      return "ant-btn-default";
  }
}

function resolveSizeClass(size) {
  if (size === "small") return "ant-btn-sm";
  if (size === "large") return "ant-btn-lg";
  return null;
}

function buildButtonClassName({
  variant,
  pagination,
  current,
  className,
  size,
  danger,
  block,
  icon,
  children,
  loading,
  disabled,
}) {
  const iconNode = loading ? <LoadingOutlined /> : icon;
  const isIconOnly = Boolean(iconNode) && children == null;

  return [
    "ant-btn",
    resolveAntBtnVariantClass(variant),
    resolveSizeClass(size),
    danger && "ant-btn-dangerous ant-btn-color-dangerous",
    block && "ant-btn-block",
    isIconOnly && "ant-btn-icon-only",
    loading && "ant-btn-loading",
    (disabled || loading) && "ant-btn-disabled",
    buildNeuClassName({ pagination, current, className }),
  ]
    .filter(Boolean)
    .join(" ");
}

function renderIconNode(icon, loading) {
  const node = loading ? <LoadingOutlined /> : icon;
  if (!node) return null;

  return createElement("span", { className: "ant-btn-icon" }, node);
}

function renderNeuButton(
  {
    variant = "default",
    type,
    pagination = false,
    current = false,
    className = "",
    icon,
    children,
    size,
    danger = false,
    block = false,
    htmlType = "button",
    loading = false,
    disabled,
    ...props
  },
  ref,
) {
  const resolvedVariant = resolveVariant(variant, type);
  const isDisabled = Boolean(disabled || loading);

  return createElement(
    "button",
    {
      ref,
      type: htmlType,
      disabled: isDisabled,
      className: buildButtonClassName({
        variant: resolvedVariant,
        pagination,
        current,
        className,
        size,
        danger,
        block,
        icon,
        children,
        loading,
        disabled: isDisabled,
      }),
      ...props,
    },
    renderIconNode(icon, loading),
    children,
  );
}

/**
 * Returns a native <button> element for Input.Search enterButton.
 * forwardRef components cannot be used there — antd would wrap another ant-btn.
 */
export function createNeuButton(props) {
  return renderNeuButton(props, null);
}

/**
 * Neumorphic button — native <button> with ant-btn + neu-btn classes.
 */
const NeuButton = forwardRef(function NeuButton(props, ref) {
  return renderNeuButton(props, ref);
});

export default NeuButton;
