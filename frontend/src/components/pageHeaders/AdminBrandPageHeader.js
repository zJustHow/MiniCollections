import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import HeaderActionButton from "../HeaderActionButton";
import { useLocale } from "../../LocaleContext";

export default function AdminBrandPageHeader({ brandName, onBack, onAdd }) {
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
          aria-label={t("addBrand")}
        />
      </div>
      <span className="header-slot-title">{brandName}</span>
    </div>
  );
}
