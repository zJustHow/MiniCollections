import ArrowLeftOutlined from "@ant-design/icons/es/icons/ArrowLeftOutlined.js";
import PlusOutlined from "@ant-design/icons/es/icons/PlusOutlined.js";
import HeaderActionButton from "../HeaderActionButton";
import { useLocale } from "../../LocaleContext";

export default function AdminBrandPageHeader({
  brandName,
  onBack,
  onAdd,
  addAriaLabel,
}) {
  const { t } = useLocale();

  return (
    <div className="header-slot-bar">
      <div className="header-slot-actions">
        <HeaderActionButton icon={<ArrowLeftOutlined />} onClick={onBack} />
      </div>
      <div className="header-slot-actions header-slot-actions-end">
        <HeaderActionButton
          icon={<PlusOutlined />}
          onClick={onAdd}
          aria-label={addAriaLabel ?? t("addBrand")}
        />
      </div>
      <span className="header-slot-title">{brandName}</span>
    </div>
  );
}
