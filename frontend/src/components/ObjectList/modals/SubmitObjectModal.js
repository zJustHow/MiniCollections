import {
  App, DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import { BugOutlined, EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useLocale } from "../../../LocaleContext";
import { radius } from "../../../theme/radius";
import { submitFeedback, getCategories, getScales, getSeriesByBrandId } from "../../../utils";
import { useState, useEffect, useCallback } from "react";
import ImageUploadField from "../../ImageUploadField";

const OTHER_BRAND = "__OTHER__";

function MissingModelForm({ form, brands, brandValue, onBrandChange, onLoadSeries, categoryOptions, scaleOptions, seriesOptions, imageValue, onImageChange, onImageRemove }) {
  const { t } = useLocale();
  return (
    <>
      <Form.Item label={t("brand")} name="brandId">
        <Select
          showSearch
          optionFilterProp="children"
          placeholder={t("brand")}
          onChange={(v) => {
            onBrandChange(v);
            form.setFieldValue("seriesId", undefined);
            if (v !== OTHER_BRAND) {
              form.setFieldValue("customBrandName", undefined);
              onLoadSeries(v);
            } else {
              onLoadSeries(null);
            }
          }}
        >
          {(brands || []).map((b) => (
            <Select.Option key={b.id} value={b.id}>
              {b.name}
            </Select.Option>
          ))}
          <Select.Option key={OTHER_BRAND} value={OTHER_BRAND}>
            {t("brandOther")}
          </Select.Option>
        </Select>
      </Form.Item>

      {brandValue === OTHER_BRAND && (
        <Form.Item label={t("brandOtherName")} name="customBrandName">
          <Input />
        </Form.Item>
      )}

      <Form.Item label={t("nameEn")} name="nameEn">
        <Input />
      </Form.Item>

      <Form.Item label={t("nameZh")} name="nameZh">
        <Input />
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
          disabled={!brandValue || brandValue === OTHER_BRAND}
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

      <Form.Item label={t("additionalNotes")} name="notes">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item label={t("image")}>
        <ImageUploadField value={imageValue} onChange={onImageChange} onRemove={onImageRemove} />
      </Form.Item>
    </>
  );
}

function BugReportForm({ imageValue, onImageChange, onImageRemove }) {
  const { t } = useLocale();
  return (
    <>
      <Form.Item
        label={t("bugSubject")}
        name="nameEn"
        rules={[{ required: true, message: t("bugSubjectRequired") }]}
      >
        <Input placeholder={t("bugSubjectPlaceholder")} />
      </Form.Item>
      <Form.Item label={t("bugDescription")} name="notes">
        <Input.TextArea rows={5} placeholder={t("bugDescriptionPlaceholder")} />
      </Form.Item>
      <Form.Item label={t("image")}>
        <ImageUploadField value={imageValue} onChange={onImageChange} onRemove={onImageRemove} />
      </Form.Item>
    </>
  );
}

function DataCorrectionForm({ form, brands, brandValue, onBrandChange, imageValue, onImageChange, onImageRemove }) {
  const { t } = useLocale();
  return (
    <>
      <Form.Item label={t("brand")} name="brandId">
        <Select
          showSearch
          optionFilterProp="children"
          placeholder={t("brand")}
          onChange={(v) => {
            onBrandChange(v);
            if (v !== OTHER_BRAND) form.setFieldValue("customBrandName", undefined);
          }}
          allowClear
        >
          {(brands || []).map((b) => (
            <Select.Option key={b.id} value={b.id}>
              {b.name}
            </Select.Option>
          ))}
          <Select.Option key={OTHER_BRAND} value={OTHER_BRAND}>
            {t("brandOther")}
          </Select.Option>
        </Select>
      </Form.Item>

      {brandValue === OTHER_BRAND && (
        <Form.Item label={t("brandOtherName")} name="customBrandName">
          <Input />
        </Form.Item>
      )}

      <Form.Item label={t("correctionModelName")} name="nameEn">
        <Input placeholder={t("correctionModelNamePlaceholder")} />
      </Form.Item>

      <Form.Item
        label={t("correctionDescription")}
        name="notes"
        rules={[{ required: true, message: t("bugSubjectRequired") }]}
      >
        <Input.TextArea rows={4} placeholder={t("correctionDescriptionPlaceholder")} />
      </Form.Item>
      <Form.Item label={t("image")}>
        <ImageUploadField value={imageValue} onChange={onImageChange} onRemove={onImageRemove} />
      </Form.Item>
    </>
  );
}

const MODAL_TITLE_KEY = {
  MISSING_MODEL: "reportModalTitleMissingModel",
  BUG_REPORT: "reportModalTitleBugReport",
  DATA_CORRECTION: "reportModalTitleDataCorrection",
};

export default function SubmitObjectModal({ visible, onCancel, selectedBrand, brands }) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submissionType, setSubmissionType] = useState("MISSING_MODEL");
  const [brandValue, setBrandValue] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [scaleOptions, setScaleOptions] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);

  const loadSeries = useCallback(async (brandId) => {
    if (!brandId || brandId === OTHER_BRAND) {
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

  const typeOptions = [
    { value: "MISSING_MODEL", icon: <PlusCircleOutlined />, labelKey: "feedbackTypeMissingModel" },
    { value: "BUG_REPORT", icon: <BugOutlined />, labelKey: "feedbackTypeBugReport" },
    { value: "DATA_CORRECTION", icon: <EditOutlined />, labelKey: "feedbackTypeDataCorrection" },
  ];

  const handleTypeChange = (val) => {
    setSubmissionType(val);
    form.resetFields();
    setBrandValue(null);
    setImageUrl(null);
    setSeriesOptions([]);
    if (val === "MISSING_MODEL" && selectedBrand?.id) {
      form.setFieldValue("brandId", selectedBrand.id);
      setBrandValue(selectedBrand.id);
      loadSeries(selectedBrand.id);
    }
  };

  useEffect(() => {
    if (visible) {
      getCategories()
        .then((data) => setCategoryOptions(Array.isArray(data) ? data : []))
        .catch(() => setCategoryOptions([]));
      getScales()
        .then((data) => setScaleOptions(Array.isArray(data) ? data : []))
        .catch(() => setScaleOptions([]));
      if (selectedBrand?.id) {
        setBrandValue(selectedBrand.id);
        loadSeries(selectedBrand.id);
      }
    }
  }, [visible, selectedBrand, loadSeries]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setLoading(true);
    try {
      const isOther = values.brandId === OTHER_BRAND;
      const body = {
        submission_type: submissionType,
        brand_id: isOther ? null : (values.brandId ?? null),
        custom_brand_name: isOther ? (values.customBrandName || null) : null,
        name_en: values.nameEn || null,
        name_zh: values.nameZh || null,
        image_url: imageUrl || null,
        release_price_cny: values.releasePriceCny ?? null,
        release_price_usd: values.releasePriceUsd ?? null,
        release_date: values.releaseDate ? values.releaseDate.format("YYYY-MM-DD") : null,
        series_id: values.seriesId ?? null,
        category_id: values.categoryId ?? null,
        scale_id: values.scaleId ?? null,
        notes: values.notes || null,
      };
      await submitFeedback(body);
      message.success(t("submissionSubmitted"));
      form.resetFields();
      setBrandValue(null);
      setImageUrl(null);
      setSubmissionType("MISSING_MODEL");
      onCancel();
    } catch (err) {
      message.error(err?.message || t("failedToSubmit"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setBrandValue(null);
    setImageUrl(null);
    setSubmissionType("MISSING_MODEL");
    onCancel();
  };

  const imageProps = { imageValue: imageUrl, onImageChange: setImageUrl, onImageRemove: () => setImageUrl(null) };

  return (
    <Modal
      title={t(MODAL_TITLE_KEY[submissionType])}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t("submitReport")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
      centered
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          borderRadius: radius.card,
          padding: 5,
          boxShadow: "var(--inset-sm)",
          marginBottom: 20,
        }}
      >
        {typeOptions.map(({ value, icon, labelKey }) => (
          <button
            key={value}
            type="button"
            className={`neu-tab-btn${submissionType === value ? " active" : ""}`}
            style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
            onClick={() => handleTypeChange(value)}
          >
            <span style={{ marginRight: 6 }}>{icon}</span>
            {t(labelKey)}
          </button>
        ))}
      </div>

      <Form
        layout="vertical"
        form={form}
        initialValues={{ brandId: submissionType === "MISSING_MODEL" ? selectedBrand?.id : undefined }}
      >
        {submissionType === "MISSING_MODEL" && (
          <MissingModelForm
            form={form}
            brands={brands}
            brandValue={brandValue}
            onBrandChange={setBrandValue}
            onLoadSeries={loadSeries}
            categoryOptions={categoryOptions}
            scaleOptions={scaleOptions}
            seriesOptions={seriesOptions}
            {...imageProps}
          />
        )}
        {submissionType === "BUG_REPORT" && <BugReportForm {...imageProps} />}
        {submissionType === "DATA_CORRECTION" && (
          <DataCorrectionForm
            form={form}
            brands={brands}
            brandValue={brandValue}
            onBrandChange={setBrandValue}
            {...imageProps}
          />
        )}
      </Form>
    </Modal>
  );
}
