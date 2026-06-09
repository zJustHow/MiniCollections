import ArrowLeftOutlined from "@ant-design/icons/es/icons/ArrowLeftOutlined.js";
import LogoutOutlined from "@ant-design/icons/es/icons/LogoutOutlined.js";
import HeaderActionButton from "../HeaderActionButton";
import ConfirmDeleteButton from "../ConfirmDeleteButton";

export default function ProfileRouteHeader({ title, onBack, onLogout, logoutLabel, confirmLogoutLabel }) {
  return (
    <div className="header-slot-bar">
      <div className="header-slot-actions">
        <HeaderActionButton icon={<ArrowLeftOutlined />} onClick={onBack} />
      </div>
      <div className="header-slot-actions header-slot-actions-end">
        <ConfirmDeleteButton
          variant="header"
          icon={<LogoutOutlined />}
          onConfirm={onLogout}
          confirmLabel={confirmLogoutLabel}
          deleteLabel={logoutLabel}
        />
      </div>
      <span className="header-slot-title">{title}</span>
    </div>
  );
}
