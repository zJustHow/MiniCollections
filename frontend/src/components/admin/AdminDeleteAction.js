import { Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import NeuButton, { neuBtnProps } from "../NeuButton";
import { useLocale } from "../../LocaleContext";

export default function AdminDeleteAction({ title, description, onConfirm }) {
  const { t } = useLocale();
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      okText={t("delete")}
      okButtonProps={neuBtnProps({ danger: true })}
      cancelButtonProps={neuBtnProps()}
      cancelText={t("cancel")}
    >
      <NeuButton
        size="small"
        danger
        icon={<DeleteOutlined />}
        aria-label={t("delete")}
      />
    </Popconfirm>
  );
}
