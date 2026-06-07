import { EditOutlined } from "@ant-design/icons";
import NeuButton from "../NeuButton";
import { useLocale } from "../../LocaleContext";

export default function AdminEditButton({ onClick }) {
  const { t } = useLocale();
  return (
    <NeuButton
      size="small"
      icon={<EditOutlined />}
      aria-label={t("edit")}
      onClick={onClick}
    />
  );
}
