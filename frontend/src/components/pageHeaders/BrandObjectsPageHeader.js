import { useNavigate } from "react-router-dom";
import ArrowLeftOutlined from "@ant-design/icons/es/icons/ArrowLeftOutlined.js";
import EditOutlined from "@ant-design/icons/es/icons/EditOutlined.js";
import HeaderActionButton from "../HeaderActionButton";
import ConfirmDeleteButton from "../ConfirmDeleteButton";
import { useLocale } from "../../LocaleContext";
import { pickLocalizedField } from "../../utils/displayLocale";

export default function BrandObjectsPageHeader({
  brand,
  returnSearch = "",
  isAdmin = false,
  onEditBrand,
  onDeleteBrand,
}) {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const brandTitle =
    pickLocalizedField(
      brand,
      { enKey: "name_en", zhKey: "name_zh", singleKey: "name" },
      locale,
    ) ??
    brand?.name ??
    null;

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
      <span className="header-slot-title">{brandTitle ?? "…"}</span>
    </div>
  );
}
