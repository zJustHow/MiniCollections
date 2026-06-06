import React from "react";

function isDisplayableText(value) {
  if (value == null || value === false) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" && trimmed !== "—";
  }
  return true;
}

function hasVisibleChildren(children) {
  return React.Children.toArray(children).some(
    (child) => child != null && child !== false,
  );
}

export function DetailPanel({ children, className = "", style }) {
  if (!hasVisibleChildren(children)) return null;
  return (
    <div
      className={["neu-panel", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}

/** Label + body block for use inside a {@link DetailPanel}. */
export function PanelText({ label, text, children, className = "", style }) {
  const content = text ?? children;
  if (!isDisplayableText(content)) return null;
  const body =
    typeof content === "string" ? content.trim() : content;
  return (
    <div
      className={["neu-panel-text-block", className].filter(Boolean).join(" ")}
      style={style}
    >
      {label ? <div className="neu-panel-label">{label}</div> : null}
      <div className="neu-panel-body">{body}</div>
    </div>
  );
}

export function DetailDescription({ label, text, children, className = "", style }) {
  const content = text ?? children;
  if (!isDisplayableText(content)) return null;
  return (
    <div
      className={["neu-panel", className].filter(Boolean).join(" ")}
      style={style}
    >
      <PanelText label={label} text={content} />
    </div>
  );
}
