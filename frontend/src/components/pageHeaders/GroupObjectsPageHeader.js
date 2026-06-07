import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
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
