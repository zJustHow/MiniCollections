import { DatePicker, Form, Input, InputNumber, message, Modal, Select, Upload } from "antd";
import { uploadImage } from "../../../utils";
import { useLocale } from "../../../LocaleContext";

export default function AddToGroupModal({
  visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  groups,
  selectedBrandObject,
  customImageData,
  onImageChange,
}) {
  const { t } = useLocale();
  return (
    <Modal
      title={t("addToMyGroup")}
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t("name")}
          name="name"
          rules={[{ required: true, message: t("nameRequired") }]}
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
                src={customImageData || selectedBrandObject?.image_url}
                alt="preview"
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
        <Form.Item label={t("purchasePrice")} name="purchasePrice">
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode />
        </Form.Item>
        <Form.Item label={t("purchaseDate")} name="purchaseDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label={t("otherNote")} name="otherNotes">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          label={t("group")}
          name="groupId"
          rules={[{ required: true, message: t("groupRequired") }]}
        >
          <Select placeholder={t("groupSelectPlaceholder")}>
            {groups.map((g) => (
              <Select.Option key={g.id} value={g.id}>
                {g.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
