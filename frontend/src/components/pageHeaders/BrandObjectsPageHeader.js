import { Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import HeaderActionButton from "../HeaderActionButton";
import { neuBtnProps } from "../NeuButton";
import { useLocale } from "../../LocaleContext";

export default function BrandObjectsPageHeader({
  brand,
  returnSearch = "",
  isAdmin = false,
  onEditBrand,
  onDeleteBrand,
}) {
  const navigate = useNavigate();
  const { t } = useLocale();

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
          <Popconfirm
            title={t("deleteBrandTitle")}
            description={t("deleteBrandContent").replace("{name}", brand.name)}
            onConfirm={onDeleteBrand}
            okText={t("delete")}
            okButtonProps={neuBtnProps({ danger: true })}
            cancelButtonProps={neuBtnProps()}
            cancelText={t("cancel")}
          >
            <HeaderActionButton danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      )}
      <span className="header-slot-title">{brand?.name ?? "…"}</span>
    </div>
  );
}
