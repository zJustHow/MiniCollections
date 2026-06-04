import React from "react";

export function DetailPanel({ children, className = "", style }) {
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
  if (content == null || content === "") return null;
  return (
    <div
      className={["neu-panel-text-block", className].filter(Boolean).join(" ")}
      style={style}
    >
      {label ? <div className="neu-panel-label">{label}</div> : null}
      <div className="neu-panel-body">{content}</div>
    </div>
  );
}

export function DetailDescription({ label, text, children, className = "", style }) {
  const content = text ?? children;
  if (content == null || content === "") return null;
  return (
    <div
      className={["neu-panel", className].filter(Boolean).join(" ")}
      style={style}
    >
      <PanelText label={label} text={content} />
    </div>
  );
}
