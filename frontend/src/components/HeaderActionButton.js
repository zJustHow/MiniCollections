import LoadingOutlined from "@ant-design/icons/es/icons/LoadingOutlined.js";
import { forwardRef } from "react";
import NeuPressableButton from "./NeuPressableButton";

const HeaderActionButton = forwardRef(function HeaderActionButton(
  { icon, children, danger = false, loading = false, className = "", disabled, ...props },
  ref,
) {
  return (
    <NeuPressableButton
      ref={ref}
      variant="header-bar"
      danger={danger}
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingOutlined /> : (icon ?? children)}
    </NeuPressableButton>
  );
});

export default HeaderActionButton;
