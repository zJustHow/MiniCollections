import { Form, Input, message, Modal, Upload } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { adminCreateBrand, adminUpdateBrand, uploadImage } from "../../../utils";
import { useLocale } from "../../../LocaleContext";

export default function BrandModal({ open, brand, onClose, onSuccess }) {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const isEdit = !!brand;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(brand
        ? { nameEn: brand.name_en, nameZh: brand.name_zh }
        : { nameEn: "", nameZh: "" }
      );
      setImageUrl(brand?.image_url || null);
    }
  }, [open, brand, form]);

  const handleOk = async () => {
    let values;
    try { values = await form.validateFields(); } catch { return; }
    setLoading(true);
    try {
      const payload = {
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        image_url: imageUrl || null,
      };
      if (isEdit) {
        await adminUpdateBrand(brand.id, payload);
        message.success(t("brandUpdated"));
      } else {
        await adminCreateBrand(payload);
        message.success(t("brandCreated"));
      }
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err?.message || (isEdit ? t("failedToUpdateBrand") : t("failedToCreateBrand")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? t("editBrand") : t("addBrand")}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? t("edit") : t("addBrand")}
      cancelText={t("cancel")}
      confirmLoading={loading}
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
                  alt="brand-preview"
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
