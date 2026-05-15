import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import { approveSubmission } from "../../utils";
import { useLocale } from "../../LocaleContext";
import useModalForm from "../../hooks/useModalForm";

export default function ApproveModal({ open, submission, brands, onClose, onSuccess }) {
  const { t } = useLocale();

  const { form, loading, handleOk } = useModalForm({
    onSubmit: async (values) => {
      await approveSubmission(submission.id, {
        brand_id: values.brandId,
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        image_url: values.imageUrl || null,
        release_price_cny: values.releasePriceCny ?? null,
        release_price_usd: values.releasePriceUsd ?? null,
        release_date: values.releaseDate ? values.releaseDate.format("YYYY-MM-DD") : null,
        category_en: values.categoryEn || null,
        category_zh: values.categoryZh || null,
        scale: values.scale || null,
        admin_note: null,
      });
    },
    successMessage: t("submissionApproved"),
    errorMessage: t("failedToApprove"),
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (open && submission) {
      form.setFieldsValue({
        brandId: submission.brand_id,
        nameEn: submission.name_en,
        nameZh: submission.name_zh,
        imageUrl: submission.image_url,
        releasePriceCny: submission.release_price_cny,
        releasePriceUsd: submission.release_price_usd,
        releaseDate: submission.release_date ? dayjs(submission.release_date) : null,
        categoryEn: submission.category_en,
        categoryZh: submission.category_zh,
        scale: submission.scale,
      });
    }
  }, [open, submission, form]);

  return (
    <Modal
      title={t("approveTitle")}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={t("approveSubmission")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      width={600}
      centered
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("brand")} name="brandId" rules={[{ required: true, message: t("brandRequired") }]}>
          <Select showSearch optionFilterProp="children">
            {brands.map((b) => (
              <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={t("nameEn")} name="nameEn" rules={[{ required: true, message: t("nameRequired") }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t("nameZh")} name="nameZh">
          <Input />
        </Form.Item>
        <Form.Item label={t("image")} name="imageUrl">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item label={t("scale")} name="scale">
          <Input />
        </Form.Item>
        <Form.Item label={t("category")} name="categoryEn">
          <Input />
        </Form.Item>
        <Form.Item label="Category (ZH)" name="categoryZh">
          <Input />
        </Form.Item>
        <Form.Item label={t("releaseDate")} name="releaseDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label={t("priceCNY")} name="releasePriceCny">
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode />
        </Form.Item>
        <Form.Item label={t("priceUSD")} name="releasePriceUsd">
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode />
        </Form.Item>
      </Form>
    </Modal>
  );
}
