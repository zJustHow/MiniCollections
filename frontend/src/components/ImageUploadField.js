import { App, Upload } from "antd";
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { uploadImage } from "../utils";
import { useLocale } from "../LocaleContext";
import GroovedImage from "./GroovedImage";

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

  const wellClassName = logoShadow
    ? "neu-card-image-well neu-card-image-well--logo"
    : "neu-card-image-well";

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
      <div className="neu-image-upload-body">
        <div className="neu-card-cover">
          <GroovedImage
            imageUrl={value}
            alt=""
            wellClassName={wellClassName}
            fixedGroove={logoShadow}
            placeholderSize={36}
          />
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
        </div>
      </div>
    </Upload>
  );
}
