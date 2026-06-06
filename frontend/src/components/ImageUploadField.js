import { App, Upload } from "antd";
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { uploadImage } from "../utils";
import { useLocale } from "../LocaleContext";
import NeuCard from "./NeuCard";

export default function ImageUploadField({
  value,
  onChange,
  onRemove,
  uploadFn,
  logoShadow = false,
}) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const [uploading, setUploading] = useState(false);

  return (
    <Upload
      listType="picture-card"
      rootClassName="neu-image-upload"
      showUploadList={false}
      accept="image/*"
      beforeUpload={async (file) => {
        setUploading(true);
        try {
          const url = uploadFn ? await uploadFn(file) : await uploadImage(file);
          onChange(typeof url === "string" ? url : url?.image_url ?? url?.imageUrl);
        } catch (e) {
          message.error(e?.message || t("uploadFailed"));
        } finally {
          setUploading(false);
        }
        return false;
      }}
    >
      <NeuCard
        variant="upload"
        imageUrl={value}
        logoShadow={logoShadow}
        fixedGroove={logoShadow}
      >
        {uploading && (
          <div className="neu-image-upload-loading" aria-hidden="true">
            <LoadingOutlined />
          </div>
        )}
        {onRemove && value && !uploading && (
          <DeleteOutlined
            className="neu-image-upload-remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          />
        )}
      </NeuCard>
    </Upload>
  );
}
