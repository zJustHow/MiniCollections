import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from "antd";
import { useLocale } from "../../../LocaleContext";
import ImageUploadField from "../../ImageUploadField";

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
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode controls={false} />
        </Form.Item>
        <Form.Item label={t("purchaseDate")} name="purchaseDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label={t("otherNote")} name="otherNotes">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label={t("image")}>
          <ImageUploadField value={imageData} onChange={onImageChange} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
