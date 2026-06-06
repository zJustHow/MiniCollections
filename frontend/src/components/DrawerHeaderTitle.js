import { CheckOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import HeaderActionButton from "./HeaderActionButton";

export default function DrawerHeaderTitle({
  title,
  onClose,
  onDelete,
  deleteLabel = "Delete",
  onOk,
  okText,
  confirmLoading = false,
  okButtonProps,
  trailing,
}) {
  const { danger, disabled, ...restOkButtonProps } = okButtonProps ?? {};
  const hasEndActions = onDelete || onOk || trailing;

  return (
    <div className="neu-drawer-toolbar">
      <div className="neu-drawer-toolbar-actions">
        <HeaderActionButton
          icon={<CloseOutlined />}
          onClick={onClose}
          aria-label="Close"
        />
      </div>
      {hasEndActions && (
        <div className="neu-drawer-toolbar-actions neu-drawer-toolbar-actions-end">
          {onDelete && (
            <HeaderActionButton
              danger
              icon={<DeleteOutlined />}
              onClick={onDelete}
              aria-label={deleteLabel}
            />
          )}
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
          {trailing}
        </div>
      )}
      {title != null && title !== "" && (
        <div className="neu-drawer-toolbar-title">{title}</div>
      )}
    </div>
  );
}
