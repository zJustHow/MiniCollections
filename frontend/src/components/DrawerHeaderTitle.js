import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import HeaderActionButton from "./HeaderActionButton";

export default function DrawerHeaderTitle({
  title,
  onClose,
  onOk,
  okText,
  confirmLoading = false,
  okButtonProps,
}) {
  const { danger, disabled, ...restOkButtonProps } = okButtonProps ?? {};

  return (
    <div className="neu-drawer-toolbar">
      <div className="neu-drawer-toolbar-actions">
        <HeaderActionButton
          danger
          icon={<CloseOutlined />}
          onClick={onClose}
          aria-label="Close"
        />
        {onOk && (
          <HeaderActionButton
            icon={<CheckOutlined />}
            onClick={onOk}
            loading={confirmLoading}
            danger={danger}
            disabled={disabled}
            aria-label={okText}
            {...restOkButtonProps}
          />
        )}
      </div>
      {title != null && title !== "" && (
        <div className="neu-drawer-toolbar-title">{title}</div>
      )}
    </div>
  );
}
