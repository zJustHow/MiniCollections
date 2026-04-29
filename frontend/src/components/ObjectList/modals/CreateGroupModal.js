import { Form, Input, message, Modal, Upload } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { uploadImage } from "../../../utils";
import { useLocale } from "../../../LocaleContext";

export default function CreateGroupModal({
  visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  imageData,
  onImageChange,
}) {
  const { t } = useLocale();
  return (
    <Modal
      title={t("createGroup")}
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
              {imageData ? (
                <img
                  src={imageData}
                  alt="group-preview"
                  style={{ width: "100%", maxHeight: 120, objectFit: "contain", display: "block", marginBottom: 8 }}
                />
              ) : (
                <PictureOutlined style={{ fontSize: 32, color: "var(--neu-text-2)", marginBottom: 8, display: "block" }} />
              )}
              <div style={{ fontSize: 12 }}>{t("selectImage")}</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
