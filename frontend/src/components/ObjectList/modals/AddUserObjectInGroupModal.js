import {
  App,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Upload,
} from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { uploadImage } from "../../../utils";
import { useLocale } from "../../../LocaleContext";

export default function AddUserObjectInGroupModal({ visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  searchResults,
  searchLoading,
  onSearch,
  onSelectChange,
  imageData,
  onImageChange,
}) {
  const { message } = App.useApp();
  const { t } = useLocale();
  return (
    <Modal
      title={t("addModel")}
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("model")} name="brandObjectId">
          <Select
            placeholder={t("modelSearchPlaceholder")}
            allowClear
            showSearch
            loading={searchLoading}
            filterOption={false}
            onSearch={onSearch}
            onChange={onSelectChange}
          >
            {searchResults.map((bo) => (
              <Select.Option key={bo.id} value={bo.id}>
                {bo.name ?? ""}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={t("name")}
          name="name"
          rules={[{ required: true, message: t("nameRequired") }]}
        >
          <Input />
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
                  alt="preview"
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
