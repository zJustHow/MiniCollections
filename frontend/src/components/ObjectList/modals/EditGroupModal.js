import { Form, Input, message, Modal, Upload } from "antd";
import { uploadImage } from "../../../utils";
import { useLocale } from "../../../LocaleContext";

export default function EditGroupModal({
  visible,
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
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={async (file) => {
              try {
                const url = await uploadImage(file);
                onImageChange(url);
              } catch (e) {
                message.error(e.message || t("uploadFailed"));
              }
              return false;
            }}
          >
            <div style={{ width: 120 }}>
              <img
                src={
                  imageData ||
                  selectedGroup?.image_url ||
                  "https://via.placeholder.com/120x80?text=Group"
                }
                alt="group-preview"
                style={{
                  width: "100%",
                  maxHeight: 120,
                  objectFit: "contain",
                  display: "block",
                  marginBottom: 8,
                }}
              />
              <div style={{ fontSize: 12 }}>{t("selectImage")}</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
