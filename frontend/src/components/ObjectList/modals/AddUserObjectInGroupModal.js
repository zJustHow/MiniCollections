import { Form } from "antd";
import NeuFormDrawer from "../../NeuFormDrawer";
import {
  NeuDatePicker,
  NeuInput,
  NeuInputNumber,
  NeuSelect,
} from "../../NeuFormControl";
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
    <NeuFormDrawer
      title={t("addModel")}
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onClose={onCancel}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("model")} name="brandObjectId">
          <NeuSelect
            placeholder={t("modelSearchPlaceholder")}
            allowClear
            showSearch
            loading={searchLoading}
            filterOption={false}
            onSearch={onSearch}
            onChange={onSelectChange}
          >
            {searchResults.map((bo) => (
              <NeuSelect.Option key={bo.id} value={bo.id}>
                {bo.name ?? ""}
              </NeuSelect.Option>
            ))}
          </NeuSelect>
        </Form.Item>
        <Form.Item
          label={t("name")}
          name="name"
          rules={[{ required: true, message: t("nameRequired") }]}
        >
          <NeuInput />
        </Form.Item>
        <Form.Item label={t("purchasePrice")} name="purchasePrice">
          <NeuInputNumber min={0} step={0.01} stringMode controls={false} />
        </Form.Item>
        <Form.Item label={t("purchaseDate")} name="purchaseDate">
          <NeuDatePicker />
        </Form.Item>
        <Form.Item label={t("otherNote")} name="otherNotes">
          <NeuInput.TextArea rows={3} />
        </Form.Item>
        <Form.Item label={t("image")}>
          <ImageUploadField value={imageData} onChange={onImageChange} />
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
