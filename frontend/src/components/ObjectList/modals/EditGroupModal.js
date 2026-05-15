import { Form, Input, Modal } from "antd";
import { useLocale } from "../../../LocaleContext";
import ImageUploadField from "../../ImageUploadField";

export default function EditGroupModal({ visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  selectedGroup,
  imageData,
  onImageChange,
}) {
  const { t } = useLocale();
  return (
    <Modal
      title={t("editGroup")}
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label={t("name")}
          name="name"
          rules={[{ required: true, message: t("groupNameRequired") }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t("image")}>
          <ImageUploadField value={imageData || selectedGroup?.image_url} onChange={onImageChange} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
