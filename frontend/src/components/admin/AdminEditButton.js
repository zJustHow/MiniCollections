import { EditOutlined } from "@ant-design/icons";
import NeuPressableButton from "../NeuPressableButton";
import { useLocale } from "../../LocaleContext";

export default function AdminEditButton({ onClick }) {
  const { t } = useLocale();
  return (
    <NeuPressableButton
      variant=""
      className="admin-table-action-btn"
      aria-label={t("edit")}
      onClick={onClick}
    >
      <EditOutlined />
    </NeuPressableButton>
  );
}
