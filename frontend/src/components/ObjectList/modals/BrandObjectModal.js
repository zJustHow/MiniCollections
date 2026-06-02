import { DatePicker, Form, Input, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { adminCreateBrandObject, adminUpdateBrandObject } from "../../../utils";
import { useLocale } from "../../../LocaleContext";
import ImageUploadField from "../../ImageUploadField";
import useModalForm from "../../../hooks/useModalForm";

export default function BrandObjectModal({ open, brandObject, brandId, onClose, onSuccess }) {
  const { t } = useLocale();
  const [imageUrl, setImageUrl] = useState(null);
  const isEdit = !!brandObject;

  const { form, loading, handleOk } = useModalForm({
    onSubmit: async (values) => {
      const payload = {
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        image_url: imageUrl || null,
        image_source: values.imageSource || null,
        scale: values.scale || null,
        category_en: values.categoryEn || null,
        category_zh: values.categoryZh || null,
        release_date: values.releaseDate ? values.releaseDate.format("YYYY-MM-DD") : null,
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
    errorMessage: isEdit ? t("failedToUpdateBrandObject") : t("failedToCreateBrandObject"),
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue(brandObject ? {
        nameEn: brandObject.name_en,
        nameZh: brandObject.name_zh,
        scale: brandObject.scale,
        categoryEn: brandObject.category_en,
        categoryZh: brandObject.category_zh,
        releaseDate: brandObject.release_date ? dayjs(brandObject.release_date) : null,
        releasePriceCny: brandObject.release_price_cny,
        releasePriceUsd: brandObject.release_price_usd,
        imageSource: brandObject.image_source,
      } : {
        nameEn: "", nameZh: "", scale: "",
        categoryEn: "", categoryZh: "", releaseDate: null,
        releasePriceCny: null, releasePriceUsd: null,
        imageSource: "",
      });
      setImageUrl(brandObject?.image_url || null);
    }
  }, [open, brandObject, form]);

  return (
    <Modal
      title={isEdit ? t("editBrandObject") : t("addBrandObject")}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? t("edit") : t("addBrandObject")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      width={600}
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
        <Form.Item label={t("scale")} name="scale">
          <Input />
        </Form.Item>
        <Form.Item label={t("categoryEn")} name="categoryEn">
          <Input />
        </Form.Item>
        <Form.Item label={t("categoryZh")} name="categoryZh">
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
        <Form.Item label={t("image")}>
          <ImageUploadField value={imageUrl} onChange={setImageUrl} />
        </Form.Item>
        <Form.Item label={t("imageSource")} name="imageSource">
          <Input placeholder={t("imageSource")} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
