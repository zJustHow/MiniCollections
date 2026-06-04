import { Form } from "antd";
import NeuFormDrawer from "../../NeuFormDrawer";
import {
  NeuDatePicker,
  NeuInput,
  NeuInputNumber,
  NeuSelect,
} from "../../NeuFormControl";
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
    <NeuFormDrawer
      zIndex={Z_INDEX.MODAL_EDIT_USER_OBJECT}
      title={t("editModel")}
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onClose={onCancel}
      destroyOnClose
      width={520}
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
            onChange={(value) => form.setFieldsValue({ brandObjectId: value })}
            optionFilterProp="children"
            dropdownStyle={{ zIndex: Z_INDEX.SELECT_DROPDOWN_IN_EDIT_MODAL }}
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
          <ImageUploadField value={imageData || selectedUserObject?.image_url} onChange={onImageChange} />
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
