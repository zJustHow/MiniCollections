import { DatePicker, Form, Input, InputNumber, message, Modal, Upload } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { adminCreateBrandObject, adminUpdateBrandObject, uploadImage } from "../../../utils";
import { useLocale } from "../../../LocaleContext";

export default function BrandObjectModal({ open, brandObject, brandId, onClose, onSuccess }) {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const isEdit = !!brandObject;

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
      } : {
        nameEn: "", nameZh: "", scale: "",
        categoryEn: "", categoryZh: "", releaseDate: null,
        releasePriceCny: null, releasePriceUsd: null,
      });
      setImageUrl(brandObject?.image_url || null);
    }
  }, [open, brandObject, form]);

  const handleOk = async () => {
    let values;
    try { values = await form.validateFields(); } catch { return; }
    setLoading(true);
    try {
      const payload = {
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        image_url: imageUrl || null,
        scale: values.scale || null,
        category_en: values.categoryEn || null,
        category_zh: values.categoryZh || null,
        release_date: values.releaseDate ? values.releaseDate.format("YYYY-MM-DD") : null,
        release_price_cny: values.releasePriceCny ?? null,
        release_price_usd: values.releasePriceUsd ?? null,
      };
      if (isEdit) {
        await adminUpdateBrandObject(brandObject.id, payload);
        message.success(t("brandObjectUpdated"));
      } else {
        await adminCreateBrandObject(brandId, payload);
        message.success(t("brandObjectCreated"));
      }
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err?.message || (isEdit ? t("failedToUpdateBrandObject") : t("failedToCreateBrandObject")));
    } finally {
      setLoading(false);
    }
  };

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
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={async (file) => {
              try {
                const url = await uploadImage(file);
                setImageUrl(url);
              } catch (e) {
                message.error(e.message || t("uploadFailed"));
              }
              return false;
            }}
          >
            <div style={{ width: 120 }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="object-preview"
                  style={{ width: "100%", maxHeight: 120, objectFit: "contain", display: "block", marginBottom: 8 }}
                />
              ) : (
                <PictureOutlined style={{ fontSize: 32, color: "var(--neu-text-2)", marginBottom: 8, display: "block" }} />
              )}
              <div style={{ fontSize: 12 }}>{t("selectImage")}</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
