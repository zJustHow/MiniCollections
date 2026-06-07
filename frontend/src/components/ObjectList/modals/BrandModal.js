import { Form } from "antd";
import NeuFormDrawer from "../../NeuFormDrawer";
import { NeuInput } from "../../NeuFormControl";
import { useEffect, useState } from "react";
import { adminCreateBrand, adminUpdateBrand, uploadBrandLogo } from "../../../utils";
import { useLocale } from "../../../LocaleContext";
import BrandLogoUploadField from "../../BrandLogoUploadField";
import useModalForm from "../../../hooks/useModalForm";

export default function BrandModal({ open, brand, onClose, onSuccess }) {
  const { t } = useLocale();
  const [imageUrl, setImageUrl] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const isEdit = !!brand;

  const { form, loading, handleOk } = useModalForm({
    onSubmit: async (values) => {
      const abbreviation = values.abbreviation?.trim() || null;
      const payload = {
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        abbreviation,
        image_url: imageUrl || null,
      };
      if (isEdit) {
        await adminUpdateBrand(brand.id, payload);
      } else {
        const created = await adminCreateBrand({
          name_en: payload.name_en,
          name_zh: payload.name_zh,
          abbreviation,
          image_url: null,
        });
        if (pendingLogoFile && created?.id) {
          const updated = await uploadBrandLogo(created.id, pendingLogoFile);
          setImageUrl(updated.image_url ?? updated.imageUrl ?? null);
        }
      }
    },
    successMessage: isEdit ? t("brandUpdated") : t("brandCreated"),
    errorMessage: isEdit ? t("failedToUpdateBrand") : t("failedToCreateBrand"),
    onSuccess,
    onClose,
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue(brand
        ? {
          nameEn: brand.name_en,
          nameZh: brand.name_zh,
          abbreviation: brand.abbreviation ?? "",
        }
        : { nameEn: "", nameZh: "", abbreviation: "" }
      );
      setImageUrl(brand?.image_url ?? brand?.imageUrl ?? null);
      setPendingLogoFile(null);
    }
  }, [open, brand, form]);

  return (
    <NeuFormDrawer
      title={isEdit ? t("editBrand") : t("addBrand")}
      open={open}
      onOk={handleOk}
      onClose={onClose}
      okText={isEdit ? t("edit") : t("addBrand")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("nameEn")} name="nameEn" rules={[{ required: true, message: t("nameRequired") }]}>
          <NeuInput />
        </Form.Item>
        <Form.Item label={t("nameZh")} name="nameZh">
          <NeuInput />
        </Form.Item>
        <Form.Item label={t("abbreviation")} name="abbreviation">
          <NeuInput placeholder={t("abbreviationPlaceholder")} />
        </Form.Item>
        <Form.Item label={t("image")}>
          <BrandLogoUploadField
            brandId={isEdit ? brand.id : null}
            value={imageUrl}
            onChange={setImageUrl}
            onPendingFile={setPendingLogoFile}
          />
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
