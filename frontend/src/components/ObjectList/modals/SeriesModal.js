import { Form, Input, Modal } from "antd";
import { useEffect } from "react";
import { adminCreateSeries, adminUpdateSeries } from "../../../utils";
import { useLocale } from "../../../LocaleContext";
import useModalForm from "../../../hooks/useModalForm";

export default function SeriesModal({ open, series, brandId, onClose, onSuccess }) {
  const { t } = useLocale();
  const isEdit = !!series;

  const { form, loading, handleOk } = useModalForm({
    onSubmit: async (values) => {
      const payload = {
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
      };
      if (isEdit) {
        await adminUpdateSeries(series.id, payload);
      } else {
        await adminCreateSeries(brandId, payload);
      }
    },
    successMessage: isEdit ? t("seriesUpdated") : t("seriesCreated"),
    errorMessage: isEdit ? t("failedToUpdateSeries") : t("failedToCreateSeries"),
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue(series ? {
        nameEn: series.name_en,
        nameZh: series.name_zh,
      } : {
        nameEn: "", nameZh: "",
      });
    }
  }, [open, series, form]);

  return (
    <Modal
      title={isEdit ? t("editSeries") : t("addSeries")}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? t("edit") : t("addSeries")}
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
      </Form>
    </Modal>
  );
}
