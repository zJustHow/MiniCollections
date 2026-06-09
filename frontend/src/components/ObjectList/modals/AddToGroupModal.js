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
import { resolveImageFieldDisplay } from "../../../utils/imageFieldOverride";

export default function AddToGroupModal({ visible,
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
    <NeuFormDrawer
      title={t("addToMyGroup")}
      open={visible}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onClose={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t("name")}
          name="name"
          rules={[{ required: true, message: t("nameRequired") }]}
        >
          <NeuInput />
        </Form.Item>
        <Form.Item label={t("image")}>
          <ImageUploadField
            value={resolveImageFieldDisplay(
              customImageData,
              selectedBrandObject?.image_url ?? selectedBrandObject?.imageUrl,
            )}
            onChange={onImageChange}
          />
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
        <Form.Item
          label={t("group")}
          name="groupId"
          rules={[{ required: true, message: t("groupRequired") }]}
        >
          <NeuSelect placeholder={t("groupSelectPlaceholder")}>
            {groups.map((g) => (
              <NeuSelect.Option key={g.id} value={g.id}>
                {g.name}
              </NeuSelect.Option>
            ))}
          </NeuSelect>
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
