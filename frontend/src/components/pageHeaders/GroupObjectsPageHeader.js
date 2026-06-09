import { useNavigate } from "react-router-dom";
import ArrowLeftOutlined from "@ant-design/icons/es/icons/ArrowLeftOutlined.js";
import EditOutlined from "@ant-design/icons/es/icons/EditOutlined.js";
import HeaderActionButton from "../HeaderActionButton";
import ConfirmDeleteButton from "../ConfirmDeleteButton";

export default function GroupObjectsPageHeader({
  group,
  returnSearch = "",
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  return (
    <div className="header-slot-bar">
      <div className="header-slot-actions">
        <HeaderActionButton
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate({
              pathname: "/groups",
              search: returnSearch,
            })
          }
        />
      </div>
      {group && onEdit && onDelete && (
        <div className="header-slot-actions header-slot-actions-end">
          <HeaderActionButton icon={<EditOutlined />} onClick={onEdit} />
          <ConfirmDeleteButton variant="header" onConfirm={onDelete} />
        </div>
      )}
      <span className="header-slot-title">{group?.name ?? "…"}</span>
    </div>
  );
}
