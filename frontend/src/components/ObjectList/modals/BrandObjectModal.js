import { Form } from "antd";
import NeuFormDrawer from "../../NeuFormDrawer";
import {
  NeuDatePicker,
  NeuInput,
  NeuInputNumber,
  NeuSelect,
} from "../../NeuFormControl";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  adminCreateBrandObject,
  adminUpdateBrandObject,
  getCategories,
  getScales,
  getSeriesByBrandId,
} from "../../../utils";
import { useLocale } from "../../../LocaleContext";
import { pickSeriesName } from "../../../utils/displayLocale";
import ImageUploadField from "../../ImageUploadField";
import useModalForm from "../../../hooks/useModalForm";

export default function BrandObjectModal({
  open,
  brandObject,
  brandId,
  onClose,
  onSuccess,
  seriesRefreshKey = 0,
}) {
  const { t, locale } = useLocale();
  const [imageUrl, setImageUrl] = useState(null);
  const uploadSessionRef = useRef(null);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [scaleOptions, setScaleOptions] = useState([]);
  const isEdit = !!brandObject;

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

  const dismissModal = useCallback(async (discardSession) => {
    if (discardSession) {
      await uploadSessionRef.current?.discardAll?.();
    } else {
      uploadSessionRef.current?.commitAll?.();
    }
    onClose();
  }, [onClose]);

  const { form, loading, handleOk } = useModalForm({
    onSubmit: async (values) => {
      const payload = {
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
      };
      if (isEdit) {
        await adminUpdateBrandObject(brandObject.id, payload);
      } else {
        await adminCreateBrandObject(brandId, payload);
      }
    },
    successMessage: isEdit ? t("brandObjectUpdated") : t("brandObjectCreated"),
    errorMessage: isEdit
      ? t("failedToUpdateBrandObject")
      : t("failedToCreateBrandObject"),
    onSuccess,
    onClose: () => dismissModal(false),
  });

  useEffect(() => {
    if (open) {
      loadSeries();
      loadCategories();
      loadScales();
      form.setFieldsValue(
        brandObject
          ? {
              nameEn: brandObject.name_en,
              nameZh: brandObject.name_zh,
              scaleId: brandObject.scale_id ?? undefined,
              categoryId: brandObject.category_id ?? undefined,
              releaseDate: brandObject.release_date
                ? dayjs(brandObject.release_date)
                : null,
              seriesId: brandObject.series_id ?? undefined,
              releasePriceCny: brandObject.release_price_cny,
              releasePriceUsd: brandObject.release_price_usd,
              imageSource: brandObject.image_source,
            }
          : {
              nameEn: "",
              nameZh: "",
              scaleId: undefined,
              categoryId: undefined,
              releaseDate: null,
              seriesId: undefined,
              releasePriceCny: null,
              releasePriceUsd: null,
              imageSource: "",
            },
      );
      setImageUrl(brandObject?.image_url || null);
    }
  }, [
    open,
    brandObject,
    form,
    loadSeries,
    loadCategories,
    loadScales,
    seriesRefreshKey,
  ]);

  return (
    <NeuFormDrawer
      title={isEdit ? t("editBrandObject") : t("addBrandObject")}
      open={open}
      onOk={handleOk}
      onClose={() => dismissModal(true)}
      okText={isEdit ? t("edit") : t("addBrandObject")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
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
              label: pickSeriesName(s, locale),
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
          <ImageUploadField value={imageUrl} onChange={setImageUrl} uploadSessionRef={uploadSessionRef} />
        </Form.Item>
        <Form.Item label={t("imageSource")} name="imageSource">
          <NeuInput placeholder={t("imageSource")} />
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
