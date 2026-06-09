import { Form } from "antd";
import NeuFormDrawer from "../../NeuFormDrawer";
import { NeuInput, NeuInputNumber } from "../../NeuFormControl";
import { useEffect } from "react";
import { adminCreateScale, adminUpdateScale } from "../../../utils/adminApi";
import { useLocale } from "../../../LocaleContext";
import useModalForm from "../../../hooks/useModalForm";

export default function ScaleModal({ open, scale, onClose, onSuccess }) {
  const { t } = useLocale();
  const isEdit = !!scale;

  const { form, loading, handleOk } = useModalForm({
    onSubmit: async (values) => {
      const payload = {
        code: values.code?.trim(),
        denominator: values.denominator,
      };
      if (isEdit) {
        await adminUpdateScale(scale.id, payload);
      } else {
        await adminCreateScale(payload);
      }
    },
    successMessage: isEdit ? t("scaleUpdated") : t("scaleCreated"),
    errorMessage: isEdit ? t("failedToUpdateScale") : t("failedToCreateScale"),
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        scale
          ? {
              code: scale.code ?? "",
              denominator: scale.denominator ?? null,
            }
          : { code: "", denominator: null },
      );
    }
  }, [open, scale, form]);

  return (
    <NeuFormDrawer
      title={isEdit ? t("editScale") : t("addScale")}
      open={open}
      onOk={handleOk}
      onClose={onClose}
      okText={isEdit ? t("edit") : t("addScale")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label={t("scale")}
          name="code"
          rules={[{ required: true, message: t("scaleRequired") }]}
        >
          <NeuInput placeholder="1:64" />
        </Form.Item>
        <Form.Item
          label={t("denominator")}
          name="denominator"
          rules={[{ required: true, message: t("denominatorRequired") }]}
        >
          <NeuInputNumber min={1} precision={0} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
