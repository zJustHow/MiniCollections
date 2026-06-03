import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { approveSubmission, getCategories, getScales, getSeriesByBrandId } from "../../utils";
import { useLocale } from "../../LocaleContext";
import useModalForm from "../../hooks/useModalForm";

export default function ApproveModal({ open, submission, brands, onClose, onSuccess }) {
  const { t } = useLocale();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [scaleOptions, setScaleOptions] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);

  const loadSeries = useCallback(async (brandId) => {
    if (!brandId) {
      setSeriesOptions([]);
      return;
    }
    try {
      const data = await getSeriesByBrandId(brandId);
      setSeriesOptions(Array.isArray(data) ? data : []);
    } catch {
      setSeriesOptions([]);
    }
  }, []);

  useEffect(() => {
    if (open) {
      getCategories()
        .then((data) => setCategoryOptions(Array.isArray(data) ? data : []))
        .catch(() => setCategoryOptions([]));
      getScales()
        .then((data) => setScaleOptions(Array.isArray(data) ? data : []))
        .catch(() => setScaleOptions([]));
      if (submission?.brand_id) {
        loadSeries(submission.brand_id);
      } else {
        setSeriesOptions([]);
      }
    }
  }, [open, submission, loadSeries]);

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
        series_id: values.seriesId ?? null,
        category_id: values.categoryId ?? null,
        scale_id: values.scaleId ?? null,
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
        seriesId: submission.series_id ?? undefined,
        categoryId: submission.category_id ?? undefined,
        scaleId: submission.scale_id ?? undefined,
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
          <Select
            showSearch
            optionFilterProp="children"
            onChange={(brandId) => {
              form.setFieldValue("seriesId", undefined);
              loadSeries(brandId);
            }}
          >
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
        <Form.Item label={t("scale")} name="scaleId">
          <Select
            allowClear
            placeholder={t("scale")}
            options={scaleOptions.map((s) => ({
              value: s.id,
              label: s.code,
            }))}
          />
        </Form.Item>
        <Form.Item label={t("category")} name="categoryId">
          <Select
            allowClear
            placeholder={t("category")}
            options={categoryOptions.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
        </Form.Item>
        <Form.Item label={t("releaseDate")} name="releaseDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label={t("series")} name="seriesId">
          <Select
            allowClear
            placeholder={t("selectSeries")}
            options={seriesOptions.map((s) => ({
              value: s.id,
              label: s.name_en || s.name,
            }))}
          />
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
