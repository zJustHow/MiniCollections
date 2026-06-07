import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
import HeaderActionButton from "../HeaderActionButton";
import ConfirmDeleteButton from "../ConfirmDeleteButton";

export default function BrandObjectsPageHeader({
  brand,
  returnSearch = "",
  isAdmin = false,
  onEditBrand,
  onDeleteBrand,
}) {
  const navigate = useNavigate();

  return (
    <div className="header-slot-bar">
      <div className="header-slot-actions">
        <HeaderActionButton
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate({
              pathname: "/",
              search: returnSearch,
            })
          }
        />
      </div>
      {isAdmin && brand && onEditBrand && onDeleteBrand && (
        <div className="header-slot-actions header-slot-actions-end">
          <HeaderActionButton icon={<EditOutlined />} onClick={onEditBrand} />
          <ConfirmDeleteButton variant="header" onConfirm={onDeleteBrand} />
        </div>
      )}
      <span className="header-slot-title">{brand?.name ?? "…"}</span>
    </div>
  );
}
