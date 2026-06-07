import React from "react";
import { neuRem } from "../theme/fontScale";

function isDisplayableText(value) {
  if (value == null || value === false) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" && trimmed !== "—";
  }
  return true;
}

function isVisiblePanelChild(child) {
  if (!React.isValidElement(child)) return false;
  if (child.type === DetailRow) {
    return isDisplayableText(child.props.value);
  }
  if (child.type === PanelText) {
    return isDisplayableText(child.props.text ?? child.props.children);
  }
  return child != null && child !== false;
}

export function DetailRow({ label, value }) {
  if (!isDisplayableText(value)) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid rgba(184,182,176,0.2)",
      }}
    >
      <span
        style={{
          color: "var(--neu-text-2)",
          fontSize: neuRem(13),
          minWidth: 100,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ color: "var(--neu-text)", fontSize: neuRem(13) }}>{value}</span>
    </div>
  );
}

export function DetailPanel({ children, className = "", style }) {
  const visibleChildren = React.Children.toArray(children).filter(isVisiblePanelChild);
  if (visibleChildren.length === 0) return null;
  return (
    <div
      className={["neu-panel", className].filter(Boolean).join(" ")}
      style={style}
    >
      {visibleChildren}
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
