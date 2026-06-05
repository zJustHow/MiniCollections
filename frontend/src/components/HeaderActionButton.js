import { LoadingOutlined } from "@ant-design/icons";
import { forwardRef } from "react";

const HeaderActionButton = forwardRef(function HeaderActionButton(
  { icon, children, danger = false, loading = false, className = "", disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`neu-pressable-btn neu-header-bar-btn${danger ? " neu-pressable-btn--danger" : ""}${className ? ` ${className}` : ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingOutlined /> : (icon ?? children)}
    </button>
  );
});

export default HeaderActionButton;
