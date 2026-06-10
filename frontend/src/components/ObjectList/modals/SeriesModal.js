import { Form } from "antd";
import NeuFormDrawer from "../../NeuFormDrawer";
import { NeuInput } from "../../NeuFormControl";
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
        nameZh: series.name_zh ?? "",
      } : {
        nameEn: "", nameZh: "",
      });
    }
  }, [open, series, form]);

  return (
    <NeuFormDrawer
      title={isEdit ? t("editSeries") : t("addSeries")}
      open={open}
      onOk={handleOk}
      onClose={onClose}
      okText={isEdit ? t("edit") : t("addSeries")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("nameEn")} name="nameEn" rules={[{ required: true, message: t("nameRequired") }]}>
          <NeuInput />
        </Form.Item>
        <Form.Item label={t("nameZh")} name="nameZh">
          <NeuInput />
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
