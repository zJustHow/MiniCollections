import {
  App, DatePicker, Form, Input, InputNumber, Modal, Select, Upload } from "antd";
import { BugOutlined, EditOutlined, LoadingOutlined, PlusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useLocale } from "../../../LocaleContext";
import { submitFeedback, uploadImage } from "../../../utils";
import { useState } from "react";

const OTHER_BRAND = "__OTHER__";

function ImageUploadField({ form }) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleCustomRequest = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      form.setFieldValue("imageUrl", url);
      onSuccess({ url });
    } catch (err) {
      onError(err);
      message.error(t("imageUploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    form.setFieldValue("imageUrl", null);
    return true;
  };

  return (
    <Form.Item label={t("image")}>
      <Upload
        listType="picture-card"
        fileList={fileList}
        customRequest={handleCustomRequest}
        onChange={({ fileList: newList }) => setFileList(newList.slice(-1))}
        onRemove={handleRemove}
        accept="image/*"
        maxCount={1}
      >
        {fileList.length === 0 && (
          <div>
            {uploading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8, fontSize: 12 }}>{uploading ? "..." : "Upload"}</div>
          </div>
        )}
      </Upload>
    </Form.Item>
  );
}

const TYPES = ["MISSING_MODEL", "BUG_REPORT", "DATA_CORRECTION"];

function MissingModelForm({ form, brands, brandValue, onBrandChange }) {
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

      <Form.Item label={t("scale")} name="scale">
        <Input placeholder="e.g. 1:64" />
      </Form.Item>

      <Form.Item label={t("category")} name="categoryEn">
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

      <Form.Item label={t("additionalNotes")} name="notes">
        <Input.TextArea rows={3} />
      </Form.Item>
      <ImageUploadField form={form} />
    </>
  );
}

function BugReportForm({ form }) {
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
      <ImageUploadField form={form} />
    </>
  );
}

function DataCorrectionForm({ form, brands, brandValue, onBrandChange }) {
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
      <ImageUploadField form={form} />
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

  const typeOptions = [
    { value: "MISSING_MODEL", icon: <PlusCircleOutlined />, labelKey: "feedbackTypeMissingModel" },
    { value: "BUG_REPORT", icon: <BugOutlined />, labelKey: "feedbackTypeBugReport" },
    { value: "DATA_CORRECTION", icon: <EditOutlined />, labelKey: "feedbackTypeDataCorrection" },
  ];

  const handleTypeChange = (val) => {
    setSubmissionType(val);
    form.resetFields();
    setBrandValue(null);
    if (val === "MISSING_MODEL" && selectedBrand?.id) {
      form.setFieldValue("brandId", selectedBrand.id);
    }
  };

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
        image_url: form.getFieldValue("imageUrl") || null,
        release_price_cny: values.releasePriceCny ?? null,
        release_price_usd: values.releasePriceUsd ?? null,
        release_date: values.releaseDate ? values.releaseDate.format("YYYY-MM-DD") : null,
        category_en: values.categoryEn || null,
        category_zh: values.categoryZh || null,
        scale: values.scale || null,
        notes: values.notes || null,
      };
      await submitFeedback(body);
      message.success(t("submissionSubmitted"));
      form.resetFields();
      setBrandValue(null);
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
    setSubmissionType("MISSING_MODEL");
    onCancel();
  };

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
          borderRadius: 14,
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
          />
        )}
        {submissionType === "BUG_REPORT" && <BugReportForm form={form} />}
        {submissionType === "DATA_CORRECTION" && (
          <DataCorrectionForm
            form={form}
            brands={brands}
            brandValue={brandValue}
            onBrandChange={setBrandValue}
          />
        )}
      </Form>
    </Modal>
  );
}
