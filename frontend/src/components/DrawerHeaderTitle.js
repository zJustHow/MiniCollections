import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined.js";
import CheckOutlined from "@ant-design/icons/es/icons/CheckOutlined.js";
import HeaderActionButton from "./HeaderActionButton";
import ConfirmDeleteButton from "./ConfirmDeleteButton";

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
      <div className="header-slot-bar">
        <div className="header-slot-actions">
          <HeaderActionButton
            icon={<CloseOutlined />}
            onClick={onClose}
            aria-label="Close"
          />
        </div>
        {hasEndActions && (
          <div className="header-slot-actions header-slot-actions-end">
            {onDelete && (
              <ConfirmDeleteButton
                variant="header"
                onConfirm={onDelete}
                deleteLabel={deleteLabel}
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
          <span className="header-slot-title">{title}</span>
        )}
      </div>
    </div>
  );
}
