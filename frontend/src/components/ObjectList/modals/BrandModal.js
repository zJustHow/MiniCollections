import { Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";
import { adminCreateBrand, adminUpdateBrand } from "../../../utils";
import { useLocale } from "../../../LocaleContext";
import ImageUploadField from "../../ImageUploadField";
import useModalForm from "../../../hooks/useModalForm";

export default function BrandModal({ open, brand, onClose, onSuccess }) {
  const { t } = useLocale();
  const [imageUrl, setImageUrl] = useState(null);
  const isEdit = !!brand;

  const { form, loading, handleOk } = useModalForm({
    onSubmit: async (values) => {
      const payload = {
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        image_url: imageUrl || null,
      };
      if (isEdit) {
        await adminUpdateBrand(brand.id, payload);
      } else {
        await adminCreateBrand(payload);
      }
    },
    successMessage: isEdit ? t("brandUpdated") : t("brandCreated"),
    errorMessage: isEdit ? t("failedToUpdateBrand") : t("failedToCreateBrand"),
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue(brand
        ? { nameEn: brand.name_en, nameZh: brand.name_zh }
        : { nameEn: "", nameZh: "" }
      );
      setImageUrl(brand?.image_url || null);
    }
  }, [open, brand, form]);

  return (
    <Modal
      title={isEdit ? t("editBrand") : t("addBrand")}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? t("edit") : t("addBrand")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      centered
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("nameEn")} name="nameEn" rules={[{ required: true, message: t("nameRequired") }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t("nameZh")} name="nameZh">
          <Input />
        </Form.Item>
        <Form.Item label={t("image")}>
          <ImageUploadField value={imageUrl} onChange={setImageUrl} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
