import {
  App,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from "antd";
import { Z_INDEX } from "../constants";
import { useLocale } from "../../../LocaleContext";
import ImageUploadField from "../../ImageUploadField";

export default function EditUserObjectModal({ visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  searchResults,
  searchLoading,
  onSearch,
  imageData,
  selectedUserObject,
  onImageChange,
}) {
  const { t } = useLocale();
  return (
    <Modal
      zIndex={Z_INDEX.MODAL_EDIT_USER_OBJECT}
      title={t("editModel")}
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
            onChange={(value) => form.setFieldsValue({ brandObjectId: value })}
            optionFilterProp="children"
            dropdownStyle={{ zIndex: Z_INDEX.SELECT_DROPDOWN_IN_EDIT_MODAL }}
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
          <ImageUploadField value={imageData || selectedUserObject?.image_url} onChange={onImageChange} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
