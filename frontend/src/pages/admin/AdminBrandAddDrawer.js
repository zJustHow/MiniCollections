import NeuPressableButton from "../../components/NeuPressableButton";
import { App, Form } from "antd";
import NeuFormDrawer from "../../components/NeuFormDrawer";
import {
  NeuDatePicker,
  NeuInput,
  NeuInputNumber,
  NeuSelect,
} from "../../components/NeuFormControl";
import AppstoreOutlined from "@ant-design/icons/es/icons/AppstoreOutlined.js";
import PlusCircleOutlined from "@ant-design/icons/es/icons/PlusCircleOutlined.js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  adminCreateBrandObject,
  adminCreateSeries,
  getCategories,
  getScales,
  getSeriesByBrandId,
} from "../../utils";
import { useLocale } from "../../LocaleContext";
import { radius } from "../../theme/radius";
import ImageUploadField from "../../components/ImageUploadField";
import { neuRem } from "../../theme/fontScale";

const ADD_TITLE_KEY = {
  SERIES: "addSeries",
  MODEL: "addBrandObject",
};

export default function AdminBrandAddDrawer({
  open,
  brandId,
  onClose,
  onObjectSuccess,
  onSeriesSuccess,
}) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [addType, setAddType] = useState("SERIES");
  const [imageUrl, setImageUrl] = useState(null);
  const uploadSessionRef = useRef(null);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [scaleOptions, setScaleOptions] = useState([]);

  const loadSeries = useCallback(async () => {
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
  }, [brandId]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategoryOptions(Array.isArray(data) ? data : []);
    } catch {
      setCategoryOptions([]);
    }
  }, []);

  const loadScales = useCallback(async () => {
    try {
      const data = await getScales();
      setScaleOptions(Array.isArray(data) ? data : []);
    } catch {
      setScaleOptions([]);
    }
  }, []);

  const resetDrawer = useCallback(async (discardUploads = false) => {
    if (discardUploads) {
      await uploadSessionRef.current?.discardAll?.();
    }
    form.resetFields();
    setImageUrl(null);
    setAddType("SERIES");
  }, [form]);

  useEffect(() => {
    if (!open) return;
    loadCategories();
    loadScales();
    loadSeries();
    form.resetFields();
    setImageUrl(null);
    setAddType("SERIES");
  }, [open, form, loadCategories, loadScales, loadSeries]);

  const typeOptions = [
    { value: "SERIES", icon: <AppstoreOutlined />, labelKey: "addSeries" },
    { value: "MODEL", icon: <PlusCircleOutlined />, labelKey: "addBrandObject" },
  ];

  const handleTypeChange = async (val) => {
    if (val !== addType && addType === "MODEL") {
      await uploadSessionRef.current?.discardAll?.();
    }
    setAddType(val);
    form.resetFields();
    setImageUrl(null);
    if (val === "MODEL") {
      loadSeries();
    }
  };

  const handleClose = async () => {
    await resetDrawer(true);
    onClose();
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
      if (addType === "SERIES") {
        await adminCreateSeries(brandId, {
          name_en: values.nameEn,
          name_zh: values.nameZh || null,
        });
        message.success(t("seriesCreated"));
        onSeriesSuccess?.();
      } else {
        await adminCreateBrandObject(brandId, {
          name_en: values.nameEn,
          name_zh: values.nameZh || null,
          image_url: imageUrl || null,
          image_source: values.imageSource || null,
          scale_id: values.scaleId ?? null,
          category_id: values.categoryId ?? null,
          release_date: values.releaseDate
            ? values.releaseDate.format("YYYY-MM-DD")
            : null,
          series_id: values.seriesId ?? null,
          release_price_cny: values.releasePriceCny ?? null,
          release_price_usd: values.releasePriceUsd ?? null,
        });
        uploadSessionRef.current?.commitAll?.();
        message.success(t("brandObjectCreated"));
        onObjectSuccess?.();
      }
      await resetDrawer(false);
      onClose();
    } catch (err) {
      message.error(
        err?.message
          || (addType === "SERIES" ? t("failedToCreateSeries") : t("failedToCreateBrandObject")),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeuFormDrawer
      title={t(ADD_TITLE_KEY[addType])}
      open={open}
      onOk={handleOk}
      onClose={handleClose}
      okText={t(ADD_TITLE_KEY[addType])}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          borderRadius: radius.card,
          padding: 5,
          boxShadow: "var(--inset)",
          marginBottom: 20,
        }}
      >
        {typeOptions.map(({ value, icon, labelKey }) => (
          <NeuPressableButton
            key={value}
            active={addType === value}
            style={{ flex: 1, padding: "8px 0", fontSize: neuRem(13) }}
            onClick={() => handleTypeChange(value)}
          >
            <span style={{ marginRight: 6 }}>{icon}</span>
            {t(labelKey)}
          </NeuPressableButton>
        ))}
      </div>

      <Form layout="vertical" form={form}>
        {addType === "SERIES" ? (
          <>
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
          </>
        ) : (
          <>
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
            <Form.Item label={t("scale")} name="scaleId">
              <NeuSelect
                allowClear
                placeholder={t("scale")}
                options={scaleOptions.map((s) => ({
                  value: s.id,
                  label: s.code,
                }))}
              />
            </Form.Item>
            <Form.Item label={t("category")} name="categoryId">
              <NeuSelect
                allowClear
                placeholder={t("category")}
                options={categoryOptions.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </Form.Item>
            <Form.Item label={t("releaseDate")} name="releaseDate">
              <NeuDatePicker />
            </Form.Item>
            <Form.Item label={t("series")} name="seriesId">
              <NeuSelect
                allowClear
                placeholder={t("selectSeries")}
                options={seriesOptions.map((s) => ({
                  value: s.id,
                  label: s.name_en || s.name,
                }))}
              />
            </Form.Item>
            <Form.Item label={t("priceCNY")} name="releasePriceCny">
              <NeuInputNumber min={0} step={0.01} stringMode />
            </Form.Item>
            <Form.Item label={t("priceUSD")} name="releasePriceUsd">
              <NeuInputNumber min={0} step={0.01} stringMode />
            </Form.Item>
            <Form.Item label={t("image")}>
              <ImageUploadField
                value={imageUrl}
                onChange={setImageUrl}
                uploadSessionRef={uploadSessionRef}
              />
            </Form.Item>
            <Form.Item label={t("imageSource")} name="imageSource">
              <NeuInput placeholder={t("imageSource")} />
            </Form.Item>
          </>
        )}
      </Form>
    </NeuFormDrawer>
  );
}
