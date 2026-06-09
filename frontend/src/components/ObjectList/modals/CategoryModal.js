import { Form } from "antd";
import NeuFormDrawer from "../../NeuFormDrawer";
import { NeuInput, NeuInputNumber } from "../../NeuFormControl";
import { useEffect } from "react";
import { adminCreateCategory, adminUpdateCategory } from "../../../utils/adminApi";
import { useLocale } from "../../../LocaleContext";
import useModalForm from "../../../hooks/useModalForm";

export default function CategoryModal({ open, category, onClose, onSuccess }) {
  const { t } = useLocale();
  const isEdit = !!category;

  const { form, loading, handleOk } = useModalForm({
    onSubmit: async (values) => {
      const payload = {
        slug: values.slug?.trim(),
        name_en: values.nameEn?.trim(),
        name_zh: values.nameZh?.trim() || null,
        sort_order: values.sortOrder ?? 0,
      };
      if (isEdit) {
        await adminUpdateCategory(category.id, payload);
      } else {
        await adminCreateCategory(payload);
      }
    },
    successMessage: isEdit ? t("categoryUpdated") : t("categoryCreated"),
    errorMessage: isEdit ? t("failedToUpdateCategory") : t("failedToCreateCategory"),
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        category
          ? {
              slug: category.slug ?? "",
              nameEn: category.name_en ?? "",
              nameZh: category.name_zh ?? "",
              sortOrder: category.sort_order ?? 0,
            }
          : { slug: "", nameEn: "", nameZh: "", sortOrder: 0 },
      );
    }
  }, [open, category, form]);

  return (
    <NeuFormDrawer
      title={isEdit ? t("editCategory") : t("addCategory")}
      open={open}
      onOk={handleOk}
      onClose={onClose}
      okText={isEdit ? t("edit") : t("addCategory")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label={t("slug")}
          name="slug"
          rules={[{ required: true, message: t("slugRequired") }]}
        >
          <NeuInput />
        </Form.Item>
        <Form.Item
          label={t("nameEn")}
          name="nameEn"
          rules={[{ required: true, message: t("nameRequired") }]}
        >
          <NeuInput />
        </Form.Item>
        <Form.Item label={t("nameZh")} name="nameZh">
          <NeuInput />
        </Form.Item>
        <Form.Item label={t("sortOrder")} name="sortOrder">
          <NeuInputNumber min={0} precision={0} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
